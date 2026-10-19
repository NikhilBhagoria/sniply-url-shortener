require('dotenv').config();
try {
  require('./env').validateEnv();
  console.log('Configuration validation passed. No database connection or email was attempted.');
  if (process.env.NODE_ENV !== 'production') console.log('This configuration is for development, not production.');
} catch (err) {
  console.error('Configuration validation failed:', err.message);
  process.exitCode = 1;
}
