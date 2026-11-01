require('dotenv').config();
const mongoose = require('mongoose');
const { validateEnv } = require('./config/env');
(async () => {
  try {
    validateEnv();
    await require('./config/db')();
    const app = require('./app')();
    const server = app.listen(process.env.PORT || 5000, () => console.log('Sniply API is listening'));
    const shutdown = () => {
      const timeout = setTimeout(() => process.exit(1), 10000);
      timeout.unref();
      server.close(async () => { await mongoose.disconnect(); clearTimeout(timeout); process.exit(0); });
    };
    process.once('SIGTERM', shutdown);
    process.once('SIGINT', shutdown);
  } catch (err) {
    console.error('Startup failed:', err.message);
    process.exit(1);
  }
})();
