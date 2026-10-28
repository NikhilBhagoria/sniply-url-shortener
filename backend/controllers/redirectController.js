const UAParser = require('ua-parser-js');
const Link = require('../models/Link');
const Click = require('../models/Click');
const crypto = require('crypto');

// fire-and-forget: bump counter + log a click event
function logClick(link, req) {
  const report = () => console.error(JSON.stringify({ event: 'click_write_failed', requestId: req.requestId, linkId: link._id }));
  Link.updateOne({ _id: link._id }, { $inc: { clicks: 1 } }).catch(report);
  const ua = new UAParser(req.headers['user-agent'] || '').getResult();
  let referrer = 'Direct';
  try { if (req.get('referer')) referrer = new URL(req.get('referer')).hostname; } catch {}
  Click.create({
    link: link._id,
    // A per-link estimate, not a person identifier. Never persist the raw IP or UA.
    visitorHash: crypto.createHmac('sha256', process.env.JWT_SECRET)
      .update(JSON.stringify([String(link._id), req.ip, req.headers['user-agent'] || ''])).digest('hex'),
    linkAgeMs: Math.max(0, Date.now() - new Date(link.createdAt).getTime()),
    referrer,
    device: ua.device.type ? ua.device.type[0].toUpperCase() + ua.device.type.slice(1) : 'Desktop',
    browser: ua.browser.name || 'Unknown',
    os: ua.os.name || 'Unknown',
  }).catch(report);
}

const client = () => require('../config/env').settings().client;

// GET /:slug  — public redirect with expiry + password gating
exports.redirect = async (req, res) => {
  const link = await Link.findOne({ slug: req.params.slug });
  if (link?.isPaused) return res.redirect(`${client()}/invalid-link?reason=paused`);
  if (!link) return res.redirect(`${client()}/invalid-link?slug=${req.params.slug}&reason=not-found`);
  if (link.isExpired()) return res.redirect(`${client()}/invalid-link?slug=${req.params.slug}&reason=expired`);
  if (link.isProtected) return res.redirect(`${client()}/unlock/${link.slug}`);

  logClick(link, req);
  res.redirect(link.originalUrl);
};

// POST /api/v1/unlock/:slug  { password }  — public; verifies then returns target URL
exports.unlock = async (req, res) => {
  const { password } = req.body;
  if (typeof password !== 'string' || !password || Buffer.byteLength(password, 'utf8') > 72) return res.status(400).json({ msg: 'A valid password is required' });

  const link = await Link.findOne({ slug: req.params.slug }).select('+password');
  if (!link) return res.status(404).json({ msg: 'Short link not found' });
  if (link.isPaused) return res.status(410).json({ msg: 'This link is paused' });
  if (link.isExpired()) return res.status(410).json({ msg: 'This link has expired' });
  if (!link.isProtected) return res.json({ originalUrl: link.originalUrl });

  if (!(await link.matchPassword(password)))
    return res.status(401).json({ msg: 'Incorrect password' });

  logClick(link, req);
  res.json({ originalUrl: link.originalUrl });
};
