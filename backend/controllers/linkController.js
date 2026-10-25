const { nanoid } = require('nanoid');
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const Link = require('../models/Link');
const Click = require('../models/Click');
const { normalizeUrl } = require('../utils/url');
const v = require('../utils/validation');
const shortUrl = slug => `${(process.env.BASE_URL || 'http://localhost:5000').replace(/\/$/, '')}/${slug}`;
const publicLink = doc => {
  const o = doc.toObject ? doc.toObject() : { ...doc };
  delete o.password;
  o.shortUrl = shortUrl(o.slug);
  return o;
};
const reserved = new Set(['api', 'health', 'ready', 'favicon', 'robots']);
function fields(body, creating) {
  const result = {};
  if (creating || 'originalUrl' in body) {
    result.originalUrl = normalizeUrl(body.originalUrl);
    if (!result.originalUrl) throw v.badRequest('Provide a valid HTTP(S) URL without credentials (maximum 2048 characters)');
  }
  if ('title' in body) result.title = v.string(body.title, 'Title', { max: 200 });
  if ('expiresAt' in body) {
    if (body.expiresAt === null || body.expiresAt === '') result.expiresAt = null;
    else {
      if (typeof body.expiresAt !== 'string') throw v.badRequest('Expiry must be a date string');
      const date = new Date(body.expiresAt);
      if (!Number.isFinite(date.getTime()) || date <= new Date()) throw v.badRequest('Expiry must be a valid future date');
      result.expiresAt = date;
    }
  }
  if ('password' in body) {
    if (body.password === '' || body.password === null) { result.password = null; result.isProtected = false; }
    else { result.password = v.password(body.password); result.isProtected = true; }
  }
  if ('isPaused' in body) {
    if (typeof body.isPaused !== 'boolean') throw v.badRequest('isPaused must be true or false');
    result.isPaused = body.isPaused;
  }
  return result;
}
exports.create = async (req, res) => {
  const input = fields(req.body, true);
  let slug = req.body.slug === undefined ? '' : v.string(req.body.slug, 'Slug', { max: 30 });
  const custom = Boolean(slug);
  if (custom && (!/^[a-zA-Z0-9_-]{3,30}$/.test(slug) || reserved.has(slug.toLowerCase()))) throw v.badRequest('Choose a non-reserved slug of 3-30 letters, numbers, - or _');
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const link = await Link.create({ ...input, user: req.userId, slug: custom ? slug : nanoid(7) });
      return res.status(201).json(publicLink(link));
    } catch (err) {
      if (custom || err.code !== 11000 || !err.keyPattern?.slug || attempt === 2) throw err;
    }
  }
};
exports.update = async (req, res) => {
  const keys = Object.keys(req.body);
  if (!keys.length || keys.some(k => !['originalUrl', 'title', 'expiresAt', 'password', 'isPaused'].includes(k))) throw v.badRequest('Provide editable link fields; the slug cannot be changed');
  const changes = fields(req.body, false);
  const link = await Link.findOne({ _id: req.params.id, user: req.userId }).select('+password');
  if (!link) return res.status(404).json({ msg: 'Link not found' });
  Object.assign(link, changes);
  link.history.push({ at: new Date(), fields: keys });
  link.history = link.history.slice(-50);
  await link.save();
  res.json(publicLink(link));
};
function statusQuery(status) {
  if (!status || status === 'all') return {};
  if (status === 'active') return { isPaused: { $ne: true }, $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] };
  if (status === 'paused') return { isPaused: true };
  if (status === 'expired') return { expiresAt: { $lte: new Date() } };
  throw v.badRequest('Unknown status filter');
}
exports.list = async (req, res) => {
  const { page = '1', limit = '8', sort = 'createdAt', order = 'desc', status } = req.query;
  const query = { user: req.userId, ...statusQuery(status) };
  if (req.query.search !== undefined) {
    const search = v.string(req.query.search, 'Search', { max: 200 }).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$and = [{ $or: ['originalUrl', 'title', 'slug'].map(field => ({ [field]: { $regex: search, $options: 'i' } })) }];
  }
  if (!['createdAt', 'clicks', 'title'].includes(sort) || !['asc', 'desc'].includes(order)) throw v.badRequest('Invalid sort');
  if (!/^\d+$/.test(String(page)) || !/^\d+$/.test(String(limit))) throw v.badRequest('Page and limit must be positive integers');
  const pageNum = Math.max(1, Math.min(100000, Number(page)));
  const limitNum = Math.max(1, Math.min(50, Number(limit)));
  const [items, total] = await Promise.all([
    Link.find(query).sort({ [sort]: order === 'asc' ? 1 : -1, _id: 1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    Link.countDocuments(query),
  ]);
  res.json({ items: items.map(publicLink), total, page: pageNum, pages: Math.ceil(total / limitNum) || 1 });
};
exports.remove = async (req, res) => {
  const link = await Link.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!link) return res.status(404).json({ msg: 'Link not found' });
  await Click.deleteMany({ link: link._id });
  res.json({ msg: 'Link deleted' });
};
exports.qr = async (req, res) => {
  const link = await Link.findOne({ _id: req.params.id, user: req.userId });
  if (!link) return res.status(404).json({ msg: 'Link not found' });
  const color = (value, fallback) => typeof value === 'string' && /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value) ? '#' + value.replace('#', '') : fallback;
  const width = req.query.width === undefined ? 320 : Math.max(100, Math.min(1000, parseInt(req.query.width, 10) || 320));
  const margin = req.query.margin === undefined ? 2 : Math.max(0, Math.min(10, parseInt(req.query.margin, 10) || 0));
  const dataUrl = await QRCode.toDataURL(shortUrl(link.slug), { width, margin, color: { dark: color(req.query.dark, '#000000'), light: color(req.query.light, '#ffffff') } });
  res.json({ dataUrl, shortUrl: shortUrl(link.slug) });
};
function dateRange(query) {
  const day = value => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw v.badRequest('Dates must use YYYY-MM-DD');
    const d = new Date(value + 'T00:00:00.000Z');
    if (!Number.isFinite(d.getTime()) || d.toISOString().slice(0, 10) !== value) throw v.badRequest('Invalid date');
    return d;
  };
  const to = query.to ? day(query.to) : day(new Date().toISOString().slice(0, 10));
  const from = query.from ? day(query.from) : new Date(to.getTime() - 29 * 86400000);
  if (to < from || (to - from) / 86400000 > 365) throw v.badRequest('Choose a date range of at most 366 days, with start before end');
  return { from, to, end: new Date(to.getTime() + 86400000) };
}
async function stats(req) {
  const range = dateRange(req.query);
  const interval = req.query.interval || 'day';
  if (!['day', 'week'].includes(interval)) throw v.badRequest('Interval must be day or week');
  const link = await Link.findOne({ _id: req.params.id, user: req.userId });
  if (!link) throw Object.assign(new Error('Link not found'), { status: 404 });
  const match = { link: new mongoose.Types.ObjectId(link._id), createdAt: { $gte: range.from, $lt: range.end } };
  const group = field => Click.aggregate([{ $match: match }, { $group: { _id: '$' + field, count: { $sum: 1 } } }, { $sort: { count: -1, _id: 1 } }]);
  const previousFrom = new Date(range.from.getTime() - (range.end - range.from));
  const [devices, browsers, referrers, days, totalClicks, operatingSystems, visitors, age, previousClicks] = await Promise.all([
    group('device'), group('browser'), group('referrer'),
    Click.aggregate([{ $match: match }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' } }, count: { $sum: 1 } } }]),
    Click.countDocuments(match),
    group('os'),
    Click.aggregate([{ $match: { ...match, visitorHash: { $type: 'string', $ne: '' } } }, { $group: { _id: '$visitorHash', clicks: { $sum: 1 } } }, { $group: { _id: null, count: { $sum: 1 }, trackedClicks: { $sum: '$clicks' } } }]),
    Click.aggregate([{ $match: { ...match, linkAgeMs: { $type: 'number', $gte: 0 } } }, { $group: { _id: null, average: { $avg: '$linkAgeMs' }, samples: { $sum: 1 } } }]),
    Click.countDocuments({ link: link._id, createdAt: { $gte: previousFrom, $lt: range.from } }),
  ]);
  const counts = new Map(days.map(d => [d._id, d.count]));
  let timeline = [];
  for (let d = range.from.getTime(); d < range.end.getTime(); d += 86400000) {
    const date = new Date(d).toISOString().slice(0, 10);
    timeline.push({ date, count: counts.get(date) || 0 });
  }
  if (interval === 'week') {
    const weeks = new Map();
    for (const item of timeline) {
      const monday = new Date(item.date + 'T00:00:00Z');
      monday.setUTCDate(monday.getUTCDate() - (monday.getUTCDay() + 6) % 7);
      const key = monday.toISOString().slice(0, 10);
      weeks.set(key, (weeks.get(key) || 0) + item.count);
    }
    timeline = [...weeks].map(([date, count]) => ({ date, count }));
  }
  const map = values => values.map(x => ({ label: x._id || 'Unknown', count: x.count, percentage: totalClicks ? Math.round(x.count / totalClicks * 1000) / 10 : 0 }));
  return {
    link: publicLink(link), totalClicks, lifetimeClicks: link.clicks,
    from: range.from.toISOString().slice(0, 10), to: range.to.toISOString().slice(0, 10), timezone: 'UTC', interval,
    estimatedUniqueVisitors: visitors[0]?.count || 0, visitorTrackedClicks: visitors[0]?.trackedClicks || 0,
    averageLinkAgeMs: age[0]?.average ?? null, linkAgeSamples: age[0]?.samples || 0,
    comparison: { previousClicks, from: previousFrom.toISOString().slice(0, 10), to: new Date(range.from.getTime() - 86400000).toISOString().slice(0, 10),
      percentChange: previousClicks ? Math.round((totalClicks - previousClicks) / previousClicks * 1000) / 10 : null },
    devices: map(devices), browsers: map(browsers), referrers: map(referrers), operatingSystems: map(operatingSystems), timeline,
  };
}
exports.stats = async (req, res) => res.json(await stats(req));
exports.exportCsv = async (req, res) => {
  const data = await stats(req);
  // Only server-generated dates and numeric counts are exported; no formula-capable user input.
  res.set('Content-Disposition', 'attachment; filename="sniply-clicks.csv"');
  res.type('text/csv').send((data.interval === 'week' ? 'week_start_utc' : 'date_utc') + ',clicks\r\n' + data.timeline.map(d => `${d.date},${d.count}`).join('\r\n') + '\r\n');
};
exports.summary = async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.userId);
  const [agg] = await Link.aggregate([{ $match: { user: userId } }, { $group: { _id: null, totalLinks: { $sum: 1 }, totalClicks: { $sum: '$clicks' } } }]);
  const [top, activeLinks, pausedLinks] = await Promise.all([
    Link.find({ user: req.userId }).sort('-clicks').limit(5),
    Link.countDocuments({ user: req.userId, ...statusQuery('active') }),
    Link.countDocuments({ user: req.userId, isPaused: true }),
  ]);
  res.json({ totalLinks: agg?.totalLinks || 0, totalClicks: agg?.totalClicks || 0, activeLinks, pausedLinks, topLinks: top.map(publicLink) });
};
