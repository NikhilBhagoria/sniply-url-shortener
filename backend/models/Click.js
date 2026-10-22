const mongoose = require('mongoose');

// One document per redirect — the raw event data we aggregate for analytics
const clickSchema = new mongoose.Schema(
  {
    link: { type: mongoose.Schema.Types.ObjectId, ref: 'Link', required: true, index: true },
    referrer: { type: String, default: 'Direct' },
    device: { type: String, default: 'Unknown' },   // Desktop / Mobile / Tablet
    browser: { type: String, default: 'Unknown' },
    os: { type: String, default: 'Unknown' },
    visitorHash: { type: String, select: false },
    linkAgeMs: { type: Number, min: 0 },
  },
  { timestamps: true }
);

clickSchema.index({ link: 1, createdAt: 1 });
module.exports = mongoose.model('Click', clickSchema);
