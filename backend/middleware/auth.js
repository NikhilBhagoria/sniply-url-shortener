const jwt = require('jsonwebtoken');
module.exports = function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'Authentication required' });
  }
  try {
    req.userId = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET).id;
    next();
  } catch {
    return res.status(401).json({ msg: 'Invalid or expired token' });
  }
};
