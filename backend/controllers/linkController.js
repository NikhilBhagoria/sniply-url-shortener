const { nanoid } = require('nanoid');
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const Link = require('../models/Link');
const Click = require('../models/Click');

const normalize = (url) => (/^https?:\/\//i.test(url) ? url : `http://${url}`);
const shortUrl = (slug) => `${process.env.BASE_URL || 'http://localhost:5000'}/${slug}`;

// hide sensitive fields, expose a hasPassword flag
const publicLink = (doc) => {
  const o = doc.toObject ? doc.toObject() : doc;
  delete o.password;
  o.shortUrl = shortUrl(o.slug);
  return o;
};

// POST /api/v1/links  { originalUrl, title?, slug?, expiresAt?, password? }
exports.create = async (req, res) => {
  let { originalUrl, title, slug, expiresAt, password } = req.body;
  if (!originalUrl) return res.status(400).json({ msg: 'originalUrl is required' });
  originalUrl = normalize(originalUrl.trim());

  slug = slug?.trim();
  if (slug) {
    if (!/^[a-zA-Z0-9_-]{3,30}$/.test(slug))
      return res.status(400).json({ msg: 'Custom slug must be 3-30 chars: letters, numbers, - or _' });
    if (await Link.exists({ slug }))
      return res.status(409).json({ msg: 'That custom slug is already taken' });
  } else {
    slug = nanoid(7);
  }

  if (expiresAt) {
    const d = new Date(expiresAt);
    if (isNaN(d) || d.getTime() <= Date.now())
      return res.status(400).json({ msg: 'expiresAt must be a valid future date' });
    expiresAt = d;
  } else {
    expiresAt = null;
  }

  const link = new Link({ user: req.userId, originalUrl, title, slug, expiresAt });
  if (password && password.trim()) {
    link.password = password.trim();
    link.isProtected = true;
  }
  await link.save();
  res.status(201).json(publicLink(link));
};

// GET /api/v1/links?search=&page=&limit=
exports.list = async (req, res) => {
  const { search, page = 1, limit = 8 } = req.query;
  const query = { user: req.userId };
  if (search) query.$or = [
    { originalUrl: { $regex: search, $options: 'i' } },
    { title: { $regex: search, $options: 'i' } },
    { slug: { $regex: search, $options: 'i' } },
  ];
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 8));
  const [items, total] = await Promise.all([
    Link.find(query).sort('-createdAt').skip((pageNum - 1) * limitNum).limit(limitNum),
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

// GET /api/v1/links/:id/qr  — QR code (PNG data URL) for the short link
exports.qr = async (req, res) => {
  const link = await Link.findOne({ _id: req.params.id, user: req.userId });
  if (!link) return res.status(404).json({ msg: 'Link not found' });
  const dataUrl = await QRCode.toDataURL(shortUrl(link.slug), { width: 320, margin: 2 });
  res.json({ dataUrl, shortUrl: shortUrl(link.slug) });
};

// GET /api/v1/links/:id/stats
exports.stats = async (req, res) => {
  const link = await Link.findOne({ _id: req.params.id, user: req.userId });
  if (!link) return res.status(404).json({ msg: 'Link not found' });
  const linkId = new mongoose.Types.ObjectId(link._id);

  const groupBy = (field) => Click.aggregate([
    { $match: { link: linkId } },
    { $group: { _id: `$${field}`, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  const byDay = Click.aggregate([
    { $match: { link: linkId } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }, { $limit: 60 },
  ]);

  const [devices, browsers, referrers, timeline] = await Promise.all([
    groupBy('device'), groupBy('browser'), groupBy('referrer'), byDay,
  ]);

  res.json({
    link: publicLink(link),
    totalClicks: link.clicks,
    devices: devices.map((d) => ({ label: d._id, count: d.count })),
    browsers: browsers.map((b) => ({ label: b._id, count: b.count })),
    referrers: referrers.map((r) => ({ label: r._id, count: r.count })),
    timeline: timeline.map((t) => ({ date: t._id, count: t.count })),
  });
};

exports.summary = async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.userId);
  const [agg] = await Link.aggregate([
    { $match: { user: userId } },
    { $group: { _id: null, totalLinks: { $sum: 1 }, totalClicks: { $sum: '$clicks' } } },
  ]);
  const top = await Link.find({ user: req.userId }).sort('-clicks').limit(5);
  res.json({
    totalLinks: agg?.totalLinks || 0,
    totalClicks: agg?.totalClicks || 0,
    topLinks: top.map(publicLink),
  });
};
