const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const linkSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    originalUrl: { type: String, required: [true, 'URL is required'], trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, trim: true },
    clicks: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null },
    isProtected: { type: Boolean, default: false },
    password: { type: String, select: false, default: null },
  },
  { timestamps: true }
);

// hash password whenever it is set/changed
linkSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 10);
});

linkSchema.methods.matchPassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

linkSchema.methods.isExpired = function () {
  return this.expiresAt && this.expiresAt.getTime() < Date.now();
};

module.exports = mongoose.model('Link', linkSchema);
