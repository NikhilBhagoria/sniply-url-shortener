require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const openapi = require('./docs/openapi');
const { redirect, unlock } = require('./controllers/redirectController');

const app = express();

// Trust reverse proxy (e.g. NGINX / Heroku / Vercel / Render)
app.set('trust proxy', 1);

// Configure CORS
const clientUrl = (process.env.CLIENT_URL || '').replace(/\/$/, '');
const allowedOrigins = clientUrl ? clientUrl.split(',').map((u) => u.trim()) : '*';
app.use(cors({
  origin: allowedOrigins === '*' ? '*' : (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Fallback for flexibility
    }
  },
  credentials: true,
}));

app.use(express.json());

// Rate Limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per IP
  message: { msg: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { msg: 'Too many API requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi));

app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/links', require('./routes/linkRoutes'));

app.post('/api/v1/unlock/:slug', authLimiter, unlock); // public: verify password, return target URL

// public short-link redirect (keep after /api routes)
app.get('/:slug', redirect);

// friendly fallback for anything else (e.g. /slug/extra)
app.get('*', (req, res) => res.redirect(`${clientUrl}/404`));

app.use((req, res) => res.status(404).json({ msg: 'Route not found' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
(async () => {
  try {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'replace_with_a_long_random_string') {
      console.warn('⚠️ WARNING: JWT_SECRET is using default or unset secret. Change it in .env for production!');
    }
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT} — docs at /api/docs`));
  } catch (err) {
    console.error('Startup failed:', err.message);
    process.exit(1);
  }
})();
