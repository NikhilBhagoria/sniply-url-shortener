const crypto = require('crypto');
const ApiKey = require('../models/ApiKey');
const User = require('../models/User');
const v = require('../utils/validation');
exports.list = async (req, res) => {
  const user = await User.findById(req.userId);
  res.json({ items: await ApiKey.find({ user: req.userId, tokenVersion: user.tokenVersion }).select('name prefix scopes expiresAt revokedAt lastUsedAt createdAt').sort('-createdAt') });
};
exports.create = async (req, res) => {
  const name = v.string(req.body.name, 'Name', { min: 1, max: 80 });
  const scopes = req.body.scopes;
  if (!Array.isArray(scopes) || !scopes.length || scopes.length > 2 || scopes.some(s => !['links:read', 'links:write'].includes(s))) throw v.badRequest('Choose read and/or write permissions');
  const days = req.body.days === undefined ? 30 : req.body.days;
  if (!Number.isInteger(days) || days < 1 || days > 365) throw v.badRequest('Expiry must be 1-365 days');
  const user = await User.findById(req.userId);
  const token = 'snip_' + crypto.randomBytes(32).toString('hex');
  const key = await ApiKey.create({ user: req.userId, name, scopes: [...new Set(scopes)], tokenVersion: user.tokenVersion, prefix: token.slice(0, 13), hash: crypto.createHash('sha256').update(token).digest('hex'), expiresAt: new Date(Date.now() + days * 86400000) });
  res.status(201).json({ token, id: key._id, msg: 'Save this key now. It will not be shown again.' });
};
exports.revoke = async (req, res) => {
  const key = await ApiKey.findOneAndUpdate({ _id: req.params.id, user: req.userId }, { $set: { revokedAt: new Date() } });
  if (!key) return res.status(404).json({ msg: 'API key not found' });
  res.json({ msg: 'API key revoked' });
};
