const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-only-secret-that-is-long-enough-for-the-test-suite';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.BASE_URL = 'http://localhost:5000';
const createApp = require('../app');
const User = require('../models/User');
const Link = require('../models/Link');
const Click = require('../models/Click');
const ApiKey = require('../models/ApiKey');
const mail = require('../utils/mail');
let mongo, app, emails;
before(async () => {
  mongo = await MongoMemoryServer.create({ instance: { dbName: 'sniply_test' } });
  await mongoose.connect(mongo.getUri());
  await Promise.all([User.init(), Link.init(), Click.init(), ApiKey.init()]);
  app = createApp({ rateLimits: false });
  mail.setTestSender(async message => { emails.push(message); });
});
beforeEach(async () => { emails = []; await Promise.all([User.deleteMany({}), Link.deleteMany({}), Click.deleteMany({}), ApiKey.deleteMany({})]); });
after(async () => { await mongoose.disconnect(); if (mongo) await mongo.stop(); });
async function account(email = 'owner@example.com') {
  const r = await request(app).post('/api/v1/auth/register').send({ name: 'Owner', email, password: 'Password123!' }).expect(201);
  return r.body;
}
const auth = token => ({ Authorization: 'Bearer ' + token });
async function link(token, body = {}) {
  return (await request(app).post('/api/v1/links').set(auth(token)).send({ originalUrl: 'https://example.com/path', ...body }).expect(201)).body;
}
function emailToken() { return /#token=([a-f0-9]{64})/.exec(emails.at(-1).text)[1]; }

test('URL validation, schema protection, uniqueness, and sanitized serialization', async () => {
  const a = await account();
  for (const originalUrl of [42, {}, [], '', 'not a url', 'javascript:alert(1)', 'ftp://example.com', 'https://name:secret@example.com', 'http://']) {
    await request(app).post('/api/v1/links').set(auth(a.token)).send({ originalUrl }).expect(400);
  }
  await request(app).post('/api/v1/links').set(auth(a.token)).send({ originalUrl: 'example.com', slug: 'api' }).expect(400);
  const l = await link(a.token, { slug: 'demo', password: 'linkPassword!' });
  assert.equal(l.password, undefined); assert.equal(l.isProtected, true);
  assert.notEqual((await Link.findById(l._id).select('+password')).password, 'linkPassword!');
  await request(app).post('/api/v1/links').set(auth(a.token)).send({ originalUrl: 'https://example.com', slug: 'demo' }).expect(409);
  const again = await link(a.token); assert.notEqual(again.slug, l.slug);
});

test('all link reads, edits, deletion and export enforce ownership', async () => {
  const a = await account(); const b = await account('other@example.com'); const l = await link(a.token);
  for (const suffix of ['/stats', '/stats/export', '/qr']) await request(app).get('/api/v1/links/' + l._id + suffix).set(auth(b.token)).expect(404);
  await request(app).patch('/api/v1/links/' + l._id).set(auth(b.token)).send({ title: 'stolen' }).expect(404);
  await request(app).delete('/api/v1/links/' + l._id).set(auth(b.token)).expect(404);
  const list = await request(app).get('/api/v1/links').set(auth(b.token)).expect(200);
  assert.equal(list.body.total, 0);
  await request(app).get('/api/v1/links').expect(401);
});

test('editing preserves slug; pause blocks redirects and unlock; history omits secrets', async () => {
  const a = await account(); const l = await link(a.token, { password: 'linkPassword!' });
  const edited = await request(app).patch('/api/v1/links/' + l._id).set(auth(a.token)).send({ originalUrl: 'https://example.org/new', title: 'Updated', isPaused: true }).expect(200);
  assert.equal(edited.body.slug, l.slug); assert.equal(edited.body.history.length, 1);
  assert.equal(edited.body.password, undefined);
  const paused = await request(app).get('/' + l.slug).expect(302); assert.match(paused.headers.location, /reason=paused/);
  await request(app).post('/api/v1/unlock/' + l.slug).send({ password: 'linkPassword!' }).expect(410);
  await request(app).patch('/api/v1/links/' + l._id).set(auth(a.token)).send({ isPaused: false, password: null }).expect(200);
  const visit = await request(app).get('/' + l.slug).expect(302); assert.equal(visit.headers.location, 'https://example.org/new');
  // Drain the asynchronous analytics writes before cleaning the database.
  for (let i = 0; i < 100 && await Click.countDocuments({ link: l._id }) < 1; i++) await new Promise(r => setTimeout(r, 10));
  assert.equal(await Click.countDocuments({ link: l._id }), 1);
  await request(app).patch('/api/v1/links/' + l._id).set(auth(a.token)).send({ slug: 'changed' }).expect(400);
});

test('expiry blocks access at the exact deadline', (t) => {
  const now = Date.now();
  t.mock.method(Date, 'now', () => now);
  assert.equal(new Link({ expiresAt: new Date(now) }).isExpired(), true);
  assert.equal(new Link({ expiresAt: new Date(now + 1) }).isExpired(), false);
  assert.equal(new Link({ expiresAt: new Date(now - 1) }).isExpired(), true);
  assert.ok(!new Link().isExpired());
});

test('expired and missing links do not record clicks; protected unlock checks passwords', async () => {
  const a = await account(); const l = await link(a.token, { password: 'linkPassword!' });
  assert.match((await request(app).get('/' + l.slug).expect(302)).headers.location, /unlock/);
  await request(app).post('/api/v1/unlock/' + l.slug).send({ password: 'wrong' }).expect(401);
  await request(app).post('/api/v1/unlock/' + l.slug).send({ password: {} }).expect(400);
  await Link.updateOne({ _id: l._id }, { $set: { expiresAt: new Date(Date.now() - 1000) } });
  assert.match((await request(app).get('/' + l.slug).expect(302)).headers.location, /reason=expired/);
  await request(app).post('/api/v1/unlock/' + l.slug).send({ password: 'linkPassword!' }).expect(410);
  assert.match((await request(app).get('/missing').expect(302)).headers.location, /reason=not-found/);
  assert.equal(await Click.countDocuments({}), 0);
});

test('search is literal, sorting works and active totals exclude expired/paused links', async () => {
  const a = await account();
  const x = await link(a.token, { title: 'a.b' });
  await link(a.token, { title: 'axb', isPaused: true });
  const old = await link(a.token); await Link.updateOne({ _id: old._id }, { $set: { expiresAt: new Date(0) } });
  const found = await request(app).get('/api/v1/links').query({ search: 'a.b' }).set(auth(a.token)).expect(200);
  assert.equal(found.body.total, 1); assert.equal(found.body.items[0]._id, x._id);
  const active = await request(app).get('/api/v1/links?status=active').set(auth(a.token)).expect(200); assert.equal(active.body.total, 1);
  const summary = await request(app).get('/api/v1/links/summary').set(auth(a.token)).expect(200); assert.equal(summary.body.activeLinks, 1); assert.equal(summary.body.pausedLinks, 1);
  const sorted = await request(app).get('/api/v1/links?sort=title&order=desc').set(auth(a.token)).expect(200); assert.equal(sorted.body.items[0].title, 'axb');
  await request(app).get('/api/v1/links?sort=password').set(auth(a.token)).expect(400);
});

test('analytics boundaries, zero-fill and CSV use the same UTC range', async () => {
  const a = await account(); const l = await link(a.token);
  await Click.insertMany([
    { link: l._id, device: 'Desktop', createdAt: new Date('2026-01-01T23:59:59Z') },
    { link: l._id, device: 'Mobile', createdAt: new Date('2026-01-03T12:00:00Z') },
    { link: l._id, device: 'Tablet', createdAt: new Date('2026-01-04T00:00:00Z') },
  ]);
  const query = '?from=2026-01-01&to=2026-01-03';
  const stats = await request(app).get('/api/v1/links/' + l._id + '/stats' + query).set(auth(a.token)).expect(200);
  assert.equal(stats.body.totalClicks, 2); assert.deepEqual(stats.body.timeline.map(d => d.count), [1, 0, 1]);
  const csv = await request(app).get('/api/v1/links/' + l._id + '/stats/export' + query).set(auth(a.token)).expect(200);
  assert.match(csv.headers['content-type'], /text\/csv/); assert.match(csv.text, /2026-01-02,0/);
  await request(app).get('/api/v1/links/' + l._id + '/stats?from=2026-02-30').set(auth(a.token)).expect(400);
  await request(app).delete('/api/v1/links/' + l._id).set(auth(a.token)).expect(200);
  assert.equal(await Click.countDocuments({ link: l._id }), 0);
});

test('analytics estimates deduplicate visitors, exclude legacy gaps and compare equal periods', async () => {
  const a = await account(); const l = await link(a.token);
  await Click.insertMany([
    { link: l._id, createdAt: new Date('2026-01-01T00:00:00Z') },
    { link: l._id, createdAt: new Date('2026-01-03T23:59:59Z') },
    { link: l._id, createdAt: new Date('2026-01-04T00:00:00Z'), visitorHash: 'a', linkAgeMs: 1000, browser: 'Chrome', os: 'Windows' },
    { link: l._id, createdAt: new Date('2026-01-05T00:00:00Z'), visitorHash: 'a', linkAgeMs: 3000, browser: 'Chrome', os: 'Windows' },
    { link: l._id, createdAt: new Date('2026-01-06T23:59:59Z'), visitorHash: 'b', linkAgeMs: 5000, browser: 'Firefox', os: 'Linux' },
    { link: l._id, createdAt: new Date('2026-01-06T12:00:00Z') },
    { link: l._id, createdAt: new Date('2026-01-07T00:00:00Z'), visitorHash: 'excluded', linkAgeMs: 999999 },
  ]);
  const url = '/api/v1/links/' + l._id + '/stats';
  const { body: data } = await request(app).get(url).query({ from: '2026-01-04', to: '2026-01-06', interval: 'week' }).set(auth(a.token)).expect(200);
  assert.equal(data.totalClicks, 4); assert.equal(data.estimatedUniqueVisitors, 2); assert.equal(data.visitorTrackedClicks, 3);
  assert.equal(data.averageLinkAgeMs, 3000); assert.equal(data.linkAgeSamples, 3);
  assert.deepEqual(data.comparison, { previousClicks: 2, from: '2026-01-01', to: '2026-01-03', percentChange: 100 });
  assert.deepEqual(data.timeline, [{ date: '2025-12-29', count: 1 }, { date: '2026-01-05', count: 3 }]);
  assert.deepEqual(data.operatingSystems.find(x => x.label === 'Windows'), { label: 'Windows', count: 2, percentage: 50 });
  assert.equal(data.browsers.find(x => x.label === 'Chrome').percentage, 50);
  assert.equal(JSON.stringify(data).includes('visitorHash'), false);
  const csv = await request(app).get(url + '/export').query({ from: '2026-01-04', to: '2026-01-06', interval: 'week' }).set(auth(a.token)).expect(200);
  assert.equal(csv.text, 'week_start_utc,clicks\r\n2025-12-29,1\r\n2026-01-05,3\r\n');
  const empty = await request(app).get(url).query({ from: '2026-02-01', to: '2026-02-14', interval: 'week' }).set(auth(a.token)).expect(200);
  assert.equal(empty.body.averageLinkAgeMs, null); assert.equal(empty.body.visitorTrackedClicks, 0);
  assert.equal(empty.body.comparison.percentChange, null);
  assert.deepEqual(empty.body.timeline.map(x => x.count), [0, 0, 0]);
  const decline = await request(app).get(url).query({ from: '2026-01-08', to: '2026-01-10' }).set(auth(a.token)).expect(200);
  assert.equal(decline.body.comparison.percentChange, -100);
  await request(app).get(url).query({ interval: 'month' }).set(auth(a.token)).expect(400);
});

test('redirect and unlock record private visitor estimates and link age without storing raw identifiers', async () => {
  const a = await account(); const l = await link(a.token); const protectedLink = await link(a.token, { password: 'LinkPassword!' });
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36';
  await request(app).get('/' + l.slug).set('User-Agent', ua).set('Referer', 'https://www.google.com/search?q=private').expect(302);
  await request(app).get('/' + l.slug).set('User-Agent', ua).expect(302);
  await request(app).post('/api/v1/unlock/' + protectedLink.slug).set('User-Agent', ua).send({ password: 'LinkPassword!' }).expect(200);
  for (let i = 0; i < 100 && await Click.countDocuments({}) < 3; i++) await new Promise(r => setTimeout(r, 10));
  const events = await Click.find({ link: l._id }).select('+visitorHash').lean();
  const unlocked = await Click.findOne({ link: protectedLink._id }).select('+visitorHash').lean();
  assert.equal(events.length, 2); assert.match(events[0].visitorHash, /^[a-f0-9]{64}$/);
  assert.equal(events[0].visitorHash, events[1].visitorHash);
  assert.notEqual(events[0].visitorHash, unlocked.visitorHash);
  assert.ok(events.every(e => e.linkAgeMs >= 0)); assert.ok(unlocked.linkAgeMs >= 0);
  assert.ok(events.some(e => e.referrer === 'www.google.com'));
  assert.equal(events[0].browser, 'Chrome'); assert.equal(events[0].os, 'Windows');
  assert.equal(events[0].ip, undefined); assert.equal(events[0].userAgent, undefined);
  assert.equal((await Click.findOne({ link: l._id }).lean()).visitorHash, undefined);
});

test('reset tokens are hashed, expire and can only be consumed once; sessions invalidated', async () => {
  const a = await account();
  const known = await request(app).post('/api/v1/auth/forgot-password').send({ email: 'owner@example.com' }).expect(200);
  const missing = await request(app).post('/api/v1/auth/forgot-password').send({ email: 'missing@example.com' }).expect(200);
  assert.equal(known.body.msg, missing.body.msg);
  const token = emailToken();
  const user = await User.findById(a.user.id).select('+resetTokenHash'); assert.notEqual(user.resetTokenHash, token);
  const attempts = await Promise.all([1, 2].map(() => request(app).post('/api/v1/auth/reset-password').send({ token, password: 'NewPassword123!' })));
  assert.deepEqual(attempts.map(r => r.status).sort(), [200, 400]);
  await request(app).get('/api/v1/auth/me').set(auth(a.token)).expect(401);
  await request(app).post('/api/v1/auth/login').send({ email: 'owner@example.com', password: 'NewPassword123!' }).expect(200);
  await request(app).post('/api/v1/auth/forgot-password').send({ email: 'owner@example.com' }).expect(200);
  const expired = emailToken(); await User.updateOne({ _id: a.user.id }, { $set: { resetExpiresAt: new Date(0) } });
  await request(app).post('/api/v1/auth/reset-password').send({ token: expired, password: 'AnotherPassword!' }).expect(400);
});

test('email verification is single-use, profile fields persist, email change requires password', async () => {
  const a = await account();
  await request(app).post('/api/v1/auth/request-verification').set(auth(a.token)).send({}).expect(200);
  const token = emailToken();
  await request(app).post('/api/v1/auth/verify-email').send({ token }).expect(200);
  await request(app).post('/api/v1/auth/verify-email').send({ token }).expect(400);
  const me = await request(app).get('/api/v1/auth/me').set(auth(a.token)).expect(200); assert.equal(me.body.user.emailVerified, true);
  await request(app).put('/api/v1/auth/me').set(auth(a.token)).send({ email: 'new@example.com' }).expect(400);
  const updated = await request(app).put('/api/v1/auth/me').set(auth(a.token)).send({ company: 'Example', timezone: 'Asia/Kolkata', email: 'new@example.com', currentPassword: 'Password123!' }).expect(200);
  assert.equal(updated.body.user.emailVerified, false); assert.equal(updated.body.user.company, 'Example');
  await request(app).get('/api/v1/auth/me').set(auth(a.token)).expect(401);
  await request(app).get('/api/v1/auth/me').set(auth(updated.body.token)).expect(200);
});

test('API keys are one-time visible, scoped, owner isolated, expiring and revocable', async () => {
  const a = await account(); const b = await account('other@example.com');
  const created = await request(app).post('/api/v1/keys').set(auth(a.token)).send({ name: 'Read only', scopes: ['links:read'], days: 1 }).expect(201);
  const key = created.body.token;
  const list = await request(app).get('/api/v1/keys').set(auth(a.token)).expect(200);
  assert.equal(list.body.items[0].hash, undefined); assert.equal(list.body.items[0].token, undefined);
  await request(app).get('/api/v1/links').set(auth(key)).expect(200);
  await request(app).post('/api/v1/links').set(auth(key)).send({ originalUrl: 'https://example.com' }).expect(403);
  await request(app).get('/api/v1/auth/me').set(auth(key)).expect(403);
  await request(app).delete('/api/v1/keys/' + created.body.id).set(auth(b.token)).expect(404);
  await request(app).delete('/api/v1/keys/' + created.body.id).set(auth(a.token)).expect(200);
  await request(app).get('/api/v1/links').set(auth(key)).expect(401);
  const second = await request(app).post('/api/v1/keys').set(auth(a.token)).send({ name: 'Expiry', scopes: ['links:read'] }).expect(201);
  await ApiKey.updateOne({ _id: second.body.id }, { $set: { expiresAt: new Date(0) } });
  await request(app).get('/api/v1/links').set(auth(second.body.token)).expect(401);
});

test('API key quota is enforced through MongoDB and password changes invalidate keys', async () => {
  const a = await account();
  const k = await request(app).post('/api/v1/keys').set(auth(a.token)).send({ name: 'Script', scopes: ['links:read', 'links:write'] }).expect(201);
  await link(k.body.token);
  const start = new Date(Math.floor(Date.now() / 60000) * 60000);
  await ApiKey.updateOne({ _id: k.body.id }, { $set: { windowStart: start, windowCount: 59 } });
  const race = await Promise.all([1, 2].map(() => request(app).get('/api/v1/links').set(auth(k.body.token))));
  assert.deepEqual(race.map(r => r.status).sort(), [200, 429]);
  await request(app).post('/api/v1/auth/change-password').set(auth(a.token)).send({ currentPassword: 'wrong', password: 'NewPassword!' }).expect(400);
  await request(app).post('/api/v1/auth/change-password').set(auth(a.token)).send({ currentPassword: 'Password123!', password: 'NewPassword!' }).expect(200);
  await request(app).get('/api/v1/links').set(auth(k.body.token)).expect(401);
});

test('CORS, API 404, malformed JSON, body limits and security headers', async () => {
  await request(app).get('/api/health').set('Origin', 'https://unlisted.example').expect(403);
  const allowed = await request(app).get('/api/health').set('Origin', 'http://localhost:5173').expect(200);
  assert.equal(allowed.headers['access-control-allow-origin'], 'http://localhost:5173');
  assert.equal(allowed.headers['x-content-type-options'], 'nosniff');
  await request(app).get('/api/v1/missing').expect(404);
  await request(app).post('/api/v1/auth/login').set('Content-Type', 'application/json').send('{oops').expect(400);
  await request(app).post('/api/v1/auth/login').send([]).expect(400);
  await request(app).post('/api/v1/auth/login').send({ email: 'a'.repeat(20000) }).expect(413);
  await request(app).get('/api/ready').expect(200);
});

test('IP auth limiter returns 429 without affecting health', async () => {
  const limited = createApp();
  for (let i = 0; i < 30; i++) await request(limited).post('/api/v1/auth/login').send({}).expect(400);
  await request(limited).post('/api/v1/auth/login').send({}).expect(429);
  await request(limited).get('/api/health').expect(200);
});

test('unsafe production settings fail before startup', () => {
  const { validateEnv } = require('../config/env');
  const previous = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'dev_secret_change_me_in_production';
  assert.throws(validateEnv, /JWT_SECRET/);
  process.env.JWT_SECRET = previous;
});
