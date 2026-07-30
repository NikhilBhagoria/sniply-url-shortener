require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const openapi = require('./docs/openapi');
const { redirect, unlock } = require('./controllers/redirectController');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi));
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/links', require('./routes/linkRoutes'));
app.post('/api/v1/unlock/:slug', unlock); // public: verify password, return target URL

// public short-link redirect (keep after /api routes)
app.get('/:slug', redirect);

// friendly fallback for anything else (e.g. /slug/extra)
app.get('*', (req, res) => res.redirect(`${process.env.CLIENT_URL || ''}/404`));

app.use((req, res) => res.status(404).json({ msg: 'Route not found' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT} — docs at /api/docs`));
  } catch (err) {
    console.error('Startup failed:', err.message);
    process.exit(1);
  }
})();
