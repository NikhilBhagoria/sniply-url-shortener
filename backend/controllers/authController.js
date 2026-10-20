const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const signToken = require('../utils/token');
const v = require('../utils/validation');
const { sendAccountEmail } = require('../utils/mail');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const view = user => ({ id: user._id, name: user.name, email: user.email, emailVerified: user.emailVerified, company: user.company, timezone: user.timezone });
const session = user => ({ token: signToken(user), user: view(user) });
const generic = 'If an eligible account exists, an email will be sent.';

exports.register = async (req, res) => {
  const name = v.string(req.body.name, 'Name', { min: 1, max: 100 });
  const email = v.email(req.body.email);
  const password = v.password(req.body.password);
  const user = await User.create({ name, email, password });
  res.status(201).json(session(user));
};
exports.login = async (req, res) => {
  const email = v.email(req.body.email);
  const password = v.string(req.body.password, 'Password', { min: 1, max: 200, trim: false });
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) return res.status(401).json({ msg: 'Invalid credentials' });
  res.json(session(user));
};
exports.me = async (req, res) => res.json({ user: view(await User.findById(req.userId)) });
exports.updateMe = async (req, res) => {
  const user = await User.findById(req.userId).select('+password');
  if ('password' in req.body) throw v.badRequest('Use the change-password endpoint');
  if ('name' in req.body) user.name = v.string(req.body.name, 'Name', { min: 1, max: 100 });
  if ('company' in req.body) user.company = v.string(req.body.company, 'Company', { max: 100 });
  if ('timezone' in req.body) {
    const zone = v.string(req.body.timezone, 'Timezone', { min: 1, max: 100 });
    try { new Intl.DateTimeFormat('en', { timeZone: zone }); } catch { throw v.badRequest('Invalid timezone'); }
    user.timezone = zone;
  }
  if ('email' in req.body && v.email(req.body.email) !== user.email) {
    if (typeof req.body.currentPassword !== 'string' || !(await user.matchPassword(req.body.currentPassword))) return res.status(400).json({ msg: 'Current password is required to change email' });
    user.email = v.email(req.body.email);
    user.emailVerified = false;
    user.verificationTokenHash = undefined; user.verificationExpiresAt = undefined;
    user.resetTokenHash = undefined; user.resetExpiresAt = undefined;
    user.tokenVersion += 1;
  }
  await user.save();
  res.json(session(user));
};
async function issue(user, kind) {
  const token = crypto.randomBytes(32).toString('hex');
  const prefix = kind === 'reset' ? 'reset' : 'verification';
  const tokenHash = hash(token);
  await User.updateOne({ _id: user._id }, { $set: {
    [prefix + 'TokenHash']: tokenHash,
    [prefix + 'ExpiresAt']: new Date(Date.now() + (kind === 'reset' ? 30 * 60 : 24 * 60 * 60) * 1000),
  } });
  try { await sendAccountEmail(user.email, kind, token); }
  catch (err) {
    await User.updateOne({ _id: user._id, [prefix + 'TokenHash']: tokenHash }, { $unset: { [prefix + 'TokenHash']: '', [prefix + 'ExpiresAt']: '' } });
    throw err;
  }
}
exports.forgot = async (req, res) => {
  const email = v.email(req.body.email);
  const user = await User.findOne({ email });
  if (user) {
    try { await issue(user, 'reset'); }
    catch { console.error(JSON.stringify({ event: 'account_email_failed', requestId: req.requestId })); }
  }
  res.json({ msg: generic });
};
exports.requestVerification = async (req, res) => {
  const user = await User.findById(req.userId);
  if (user.emailVerified) return res.json({ msg: 'Email is already verified' });
  try { await issue(user, 'verification'); }
  catch { return res.status(503).json({ msg: 'Email could not be sent. Please try again later.' }); }
  res.json({ msg: 'Verification email sent. Check your inbox.' });
};
function token(value) {
  if (typeof value !== 'string' || !/^[a-f0-9]{64}$/.test(value)) throw v.badRequest('Invalid or expired link');
  return hash(value);
}
exports.reset = async (req, res) => {
  const tokenHash = token(req.body.token);
  const password = await bcrypt.hash(v.password(req.body.password), 10);
  // A single conditional update consumes the token; concurrent replays cannot succeed.
  const user = await User.findOneAndUpdate({ resetTokenHash: tokenHash, resetExpiresAt: { $gt: new Date() } }, {
    $set: { password }, $inc: { tokenVersion: 1 }, $unset: { resetTokenHash: '', resetExpiresAt: '' },
  });
  if (!user) throw v.badRequest('Invalid or expired link');
  res.json({ msg: 'Password reset. Sign in with your new password.' });
};
exports.verify = async (req, res) => {
  const user = await User.findOneAndUpdate({ verificationTokenHash: token(req.body.token), verificationExpiresAt: { $gt: new Date() } }, {
    $set: { emailVerified: true }, $unset: { verificationTokenHash: '', verificationExpiresAt: '' },
  });
  if (!user) throw v.badRequest('Invalid or expired link');
  res.json({ msg: 'Email verified. Refresh your account details to see the updated status.' });
};
exports.changePassword = async (req, res) => {
  const user = await User.findById(req.userId).select('+password');
  if (typeof req.body.currentPassword !== 'string' || !(await user.matchPassword(req.body.currentPassword))) return res.status(400).json({ msg: 'Current password is incorrect' });
  const password = await bcrypt.hash(v.password(req.body.password), 10);
  await User.updateOne({ _id: user._id }, { $set: { password }, $inc: { tokenVersion: 1 }, $unset: { resetTokenHash: '', resetExpiresAt: '' } });
  res.json({ msg: 'Password changed. Sign in again on your devices.' });
};
