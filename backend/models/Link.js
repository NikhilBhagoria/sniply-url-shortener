const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    originalUrl: { type: String, required: [true, 'URL is required'], trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, trim: true },
    clicks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Link', linkSchema);
