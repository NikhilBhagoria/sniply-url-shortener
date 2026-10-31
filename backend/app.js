require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const { settings } = require('./config/env');
const { redirect, unlock } = require('./controllers/redirectController');
function createApp({ rateLimits = true } = {}) {
  const app = express();
  const { client, origins } = settings();
  app.disable('x-powered-by');
  app.set('trust proxy', Number(process.env.TRUST_PROXY || 0));
  app.use(helmet());
  app.use((req, res, next) => {
    req.requestId = crypto.randomUUID();
    res.set('X-Request-ID', req.requestId);
    const started = Date.now();
    res.on('finish', () => {
      if (process.env.NODE_ENV !== 'test') console.log(JSON.stringify({ event: 'http_request', requestId: req.requestId, method: req.method, status: res.statusCode, durationMs: Date.now() - started }));
    });
    next();
  });
  app.use(cors({ origin: (origin, callback) => {
    if (!origin || origins.includes(origin)) callback(null, true);
    else callback(Object.assign(new Error('Origin is not allowed'), { status: 403 }));
  } }));
  app.use(express.json({ limit: '16kb', strict: true }));
  app.use((req, res, next) => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      if (!req.is('application/json')) return res.status(415).json({ msg: 'Use application/json' });
      if (!req.body || Array.isArray(req.body) || typeof req.body !== 'object') return res.status(400).json({ msg: 'JSON body must be an object' });
    }
    next();
  });
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.get('/api/ready', (req, res) => res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({ status: mongoose.connection.readyState === 1 ? 'ready' : 'unavailable' }));
  app.use('/api', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  if (rateLimits) {
    const limiter = max => rateLimit({ windowMs: 15 * 60 * 1000, limit: max, standardHeaders: 'draft-7', legacyHeaders: false, message: { msg: 'Too many requests. Please try again later.' } });
    app.use('/api', limiter(300));
    app.use('/api/v1/auth', limiter(30));
    app.use('/api/v1/unlock', limiter(30));
  }
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(require('./docs/openapi')));
  app.use('/api/v1/auth', require('./routes/authRoutes'));
  app.use('/api/v1/keys', require('./routes/keyRoutes'));
  app.use('/api/v1/links', require('./routes/linkRoutes'));
  app.post('/api/v1/unlock/:slug', unlock);
  app.use('/api', (req, res) => res.status(404).json({ msg: 'Route not found' }));
  app.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  app.get('/:slug', redirect);
  app.get('*', (req, res) => res.redirect(client + '/404'));
  app.use((req, res) => res.status(404).json({ msg: 'Route not found' }));
  app.use(require('./middleware/errorHandler'));
  return app;
}
module.exports = createApp;
