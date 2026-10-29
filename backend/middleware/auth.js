const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const ApiKey = require('../models/ApiKey');
module.exports = async function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ msg: 'Authentication required' });
  const token = header.slice(7);
  if (token.startsWith('snip_')) {
    const key = await ApiKey.findOne({ hash: crypto.createHash('sha256').update(token).digest('hex'), revokedAt: null, expiresAt: { $gt: new Date() } });
    if (!key) return res.status(401).json({ msg: 'Invalid or expired API key' });
    const user = await User.findById(key.user);
    if (!user || key.tokenVersion !== user.tokenVersion) return res.status(401).json({ msg: 'API key is no longer valid' });
    const scope = ['GET', 'HEAD'].includes(req.method) ? 'links:read' : 'links:write';
    if (!key.scopes.includes(scope)) return res.status(403).json({ msg: 'API key does not have the required permission' });
    const start = new Date(Math.floor(Date.now() / 60000) * 60000);
    await ApiKey.updateOne({ _id: key._id, $or: [{ windowStart: { $lt: start } }, { windowStart: null }] }, { $set: { windowStart: start, windowCount: 0 } });
    const used = await ApiKey.findOneAndUpdate({ _id: key._id, revokedAt: null, windowStart: start, windowCount: { $lt: 60 } }, { $inc: { windowCount: 1 }, $set: { lastUsedAt: new Date() } });
    if (!used) { res.set('Retry-After', String(Math.max(1, 60 - new Date().getSeconds()))); return res.status(429).json({ msg: 'API key limit: 60 requests per minute' }); }
    req.userId = user._id.toString(); req.apiKey = key._id;
    return next();
  }
  let payload;
  try { payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'], issuer: 'sniply', audience: 'sniply-api' }); }
  catch { return res.status(401).json({ msg: 'Invalid or expired token' }); }
  if (typeof payload.id !== 'string' || !/^[a-f0-9]{24}$/i.test(payload.id)) return res.status(401).json({ msg: 'Invalid token' });
  const user = await User.findById(payload.id);
  if (!user || payload.version !== user.tokenVersion) return res.status(401).json({ msg: 'Session expired. Please sign in again.' });
  req.userId = user._id.toString();
  next();
};
module.exports.sessionOnly = (req, res, next) => req.apiKey ? res.status(403).json({ msg: 'Sign in to manage your account' }) : next();
