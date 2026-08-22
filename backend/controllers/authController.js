const User = require('../models/User');
const signToken = require('../utils/token');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ msg: 'Name, email and password are required' });
  const user = await User.create({ name, email, password });
  res.status(201).json({ token: signToken(user._id), user: { id: user._id, name: user.name, email: user.email } });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ msg: 'Email and password are required' });
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ msg: 'Invalid credentials' });
  res.json({ token: signToken(user._id), user: { id: user._id, name: user.name, email: user.email } });
};

exports.me = async (req, res) => {
  const user = await require('../models/User').findById(req.userId);
  if (!user) return res.status(404).json({ msg: 'User not found' });
  res.json({ user: { id: user._id, name: user.name, email: user.email } });
};

exports.updateMe = async (req, res) => {
  const { name, email, password } = req.body;
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ msg: 'User not found' });

  if (name) user.name = name.trim();
  if (email) {
    const existing = await User.findOne({ email: email.trim().toLowerCase(), _id: { $ne: req.userId } });
    if (existing) return res.status(409).json({ msg: 'Email is already in use' });
    user.email = email.trim().toLowerCase();
  }
  if (password && password.trim().length >= 6) {
    user.password = password.trim();
  }

  await user.save();
  res.json({ user: { id: user._id, name: user.name, email: user.email } });
};
