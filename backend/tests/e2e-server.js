// Local-only browser-test harness: disposable database and captured synthetic emails.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'e2e-only-secret-never-use-in-production-123456789';
process.env.CLIENT_URL = 'http://127.0.0.1:5175';
process.env.CORS_ORIGINS = process.env.CLIENT_URL;
process.env.BASE_URL = 'http://127.0.0.1:5055';
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
(async () => {
  const mongo = await MongoMemoryServer.create({ binary: { downloadDir: require('path').resolve(__dirname, '../node_modules/.cache/mongodb-memory-server') } });
  await mongoose.connect(mongo.getUri());
  const messages = [];
  require('../utils/mail').setTestSender(async mail => { messages.push(mail); });
  const app = express();
  app.get('/__test/mail', (req, res) => res.json(messages));
  app.use(require('../app')({ rateLimits: false }));
  const server = app.listen(5055, '127.0.0.1', () => console.log('Isolated browser-test API ready on port 5055'));
  const stop = () => server.close(async () => { await mongoose.disconnect(); await mongo.stop(); process.exit(0); });
  process.once('SIGTERM', stop); process.once('SIGINT', stop);
})().catch(err => { console.error(err); process.exit(1); });
