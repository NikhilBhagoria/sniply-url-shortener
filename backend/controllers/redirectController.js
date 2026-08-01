const UAParser = require('ua-parser-js');
const Link = require('../models/Link');
const Click = require('../models/Click');

// fire-and-forget: bump counter + log a click event
function logClick(link, req) {
  Link.updateOne({ _id: link._id }, { $inc: { clicks: 1 } }).catch(() => {});
  const ua = new UAParser(req.headers['user-agent'] || '').getResult();
  let referrer = 'Direct';
  try { if (req.get('referer')) referrer = new URL(req.get('referer')).hostname; } catch {}
  Click.create({
    link: link._id,
    referrer,
    device: ua.device.type ? ua.device.type[0].toUpperCase() + ua.device.type.slice(1) : 'Desktop',
    browser: ua.browser.name || 'Unknown',
    os: ua.os.name || 'Unknown',
  }).catch(() => {});
}

const client = () => process.env.CLIENT_URL || '';

// GET /:slug  — public redirect with expiry + password gating
exports.redirect = async (req, res) => {
  const link = await Link.findOne({ slug: req.params.slug });
  if (!link) return res.redirect(`${client()}/invalid-link?slug=${req.params.slug}&reason=not-found`);
  if (link.isExpired()) return res.redirect(`${client()}/invalid-link?slug=${req.params.slug}&reason=expired`);
  if (link.isProtected) return res.redirect(`${client()}/unlock/${link.slug}`);

  logClick(link, req);
  res.redirect(link.originalUrl);
};

// POST /api/v1/unlock/:slug  { password }  — public; verifies then returns target URL
exports.unlock = async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ msg: 'Password is required' });

  const link = await Link.findOne({ slug: req.params.slug }).select('+password');
  if (!link) return res.status(404).json({ msg: 'Short link not found' });
  if (link.isExpired()) return res.status(410).json({ msg: 'This link has expired' });
  if (!link.isProtected) return res.json({ originalUrl: link.originalUrl });

  if (!(await link.matchPassword(password)))
    return res.status(401).json({ msg: 'Incorrect password' });

  logClick(link, req);
  res.json({ originalUrl: link.originalUrl });
};
