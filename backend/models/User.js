const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    emailVerified: { type: Boolean, default: false },
    tokenVersion: { type: Number, default: 0 },
    resetTokenHash: { type: String, select: false },
    resetExpiresAt: { type: Date, select: false },
    verificationTokenHash: { type: String, select: false },
    verificationExpiresAt: { type: Date, select: false },
    company: { type: String, default: '', maxlength: 100 },
    timezone: { type: String, default: 'UTC' },
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String, required: [true, 'Email is required'], unique: true, lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String, required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'], select: false,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});
userSchema.methods.matchPassword = function (c) { return bcrypt.compare(c, this.password); };

userSchema.index({ resetTokenHash: 1 }, { sparse: true });
userSchema.index({ verificationTokenHash: 1 }, { sparse: true });
module.exports = mongoose.model('User', userSchema);
