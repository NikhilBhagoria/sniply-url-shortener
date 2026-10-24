const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  hash: { type: String, required: true, unique: true, select: false },
  prefix: String,
  scopes: [{ type: String, enum: ['links:read', 'links:write'] }],
  tokenVersion: { type: Number, required: true },
  expiresAt: { type: Date, required: true },
  revokedAt: { type: Date, default: null },
  lastUsedAt: Date,
  windowStart: Date,
  windowCount: { type: Number, default: 0 },
}, { timestamps: true });
module.exports = mongoose.model('ApiKey', schema);
