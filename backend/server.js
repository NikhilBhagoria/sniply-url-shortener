require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { redirect } = require('./controllers/redirectController');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/links', require('./routes/linkRoutes'));

// public short-link redirect (keep last so it doesn't shadow /api routes)
app.get('/:slug', redirect);

app.get('*', (req, res) => res.redirect(`${process.env.CLIENT_URL || ''}/404`));
app.use((req, res) => res.status(404).json({ msg: 'Route not found' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Startup failed:', err.message);
    process.exit(1);
  }
})();
