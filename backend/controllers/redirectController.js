const UAParser = require('ua-parser-js');
const Link = require('../models/Link');
const Click = require('../models/Click');

// GET /:slug  — public redirect + fire-and-forget click logging
exports.redirect = async (req, res) => {
  const slug = req.params.slug;
  const link = await Link.findOne({ slug });
  if (!link) {
    // return res.status(404).json({
    //   msg: 'Short link not found',
    //   hint: 'The slug you entered does not exist or may be invalid.',
    //   slug,
    // });
     return res.redirect(`${process.env.CLIENT_URL || ''}/404`);
  }

  // increment counter atomically
  Link.updateOne({ _id: link._id }, { $inc: { clicks: 1 } }).catch(() => {});

  // parse UA + referrer, log a Click event (don't block the redirect)
  const ua = new UAParser(req.headers['user-agent'] || '').getResult();
  let referrer = 'Direct';
  try {
    if (req.get('referer')) referrer = new URL(req.get('referer')).hostname;
  } catch { /* keep Direct */ }

  Click.create({
    link: link._id,
    referrer,
    device: ua.device.type ? ua.device.type[0].toUpperCase() + ua.device.type.slice(1) : 'Desktop',
    browser: ua.browser.name || 'Unknown',
    os: ua.os.name || 'Unknown',
  }).catch(() => {});

  res.redirect(link.originalUrl);
};
