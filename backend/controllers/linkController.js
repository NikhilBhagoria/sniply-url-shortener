const { nanoid } = require('nanoid');
const mongoose = require('mongoose');
const Link = require('../models/Link');
const Click = require('../models/Click');
const { normalizeUrl, isValidHttpUrl } = require('../utils/url');

const INVALID_LINK_MESSAGE = 'This link does not exist or the URL is invalid';
const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

// POST /api/v1/links  { originalUrl, title?, slug? }
exports.create = async (req, res) => {
  let { originalUrl, title, slug } = req.body;
  if (!originalUrl) return res.status(400).json({ msg: 'originalUrl is required' });

  const normalizedUrl = normalizeUrl(originalUrl);
  if (!isValidHttpUrl(normalizedUrl)) {
    return res.status(400).json({ msg: 'Please provide a valid URL' });
  }

  originalUrl = normalizedUrl;

  slug = slug?.trim();
  if (slug) {
    if (!/^[a-zA-Z0-9_-]{3,30}$/.test(slug))
      return res.status(400).json({ msg: 'Custom slug must be 3-30 chars: letters, numbers, - or _' });
    if (await Link.exists({ slug }))
      return res.status(409).json({ msg: 'That custom slug is already taken' });
  } else {
    slug = nanoid(7);
  }

  const link = await Link.create({ user: req.userId, originalUrl, title, slug });
  res.status(201).json(link);
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
  res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) || 1 });
};

exports.remove = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(404).json({ msg: INVALID_LINK_MESSAGE });
  }

  const link = await Link.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!link) return res.status(404).json({ msg: 'Link not found' });
  await Click.deleteMany({ link: link._id });
  res.json({ msg: 'Link deleted' });
};

// GET /api/v1/links/:id/stats  — aggregation over Click events
exports.stats = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(404).json({ msg: INVALID_LINK_MESSAGE });
  }

  const link = await Link.findOne({ _id: req.params.id, user: req.userId });
  if (!link) return res.status(404).json({ msg: 'Link not found' });
  const linkId = new mongoose.Types.ObjectId(link._id);

  const groupBy = (field) => Click.aggregate([
    { $match: { link: linkId } },
    { $group: { _id: `$${field}`, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // clicks per day for the last 14 days
  const byDay = Click.aggregate([
    { $match: { link: linkId } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $limit: 60 },
  ]);

  const [devices, browsers, referrers, timeline] = await Promise.all([
    groupBy('device'), groupBy('browser'), groupBy('referrer'), byDay,
  ]);

  res.json({
    link,
    totalClicks: link.clicks,
    devices: devices.map((d) => ({ label: d._id, count: d.count })),
    browsers: browsers.map((b) => ({ label: b._id, count: b.count })),
    referrers: referrers.map((r) => ({ label: r._id, count: r.count })),
    timeline: timeline.map((t) => ({ date: t._id, count: t.count })),
  });
};

// Dashboard summary across all of the user's links
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
    topLinks: top,
  });
};
