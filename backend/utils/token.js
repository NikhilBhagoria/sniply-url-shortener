const jwt = require('jsonwebtoken');
module.exports = user => jwt.sign({ id: user._id.toString(), version: user.tokenVersion || 0 }, process.env.JWT_SECRET, {
  algorithm: 'HS256', expiresIn: process.env.JWT_EXPIRES || '7d', issuer: 'sniply', audience: 'sniply-api',
});
