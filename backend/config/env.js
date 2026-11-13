function origin(value, name) {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error();
    return url.origin;
  } catch { throw new Error(`${name} must be an HTTP(S) origin without a path`); }
}
function settings() {
  const client = origin(process.env.CLIENT_URL || 'http://localhost:5173', 'CLIENT_URL');
  return { client, origins: (process.env.CORS_ORIGINS || client).split(',').map(v => origin(v.trim(), 'CORS_ORIGINS')) };
}
function validateEnv() {
  const secret = process.env.JWT_SECRET || '';
  if (secret.length < 32 || /replace_with|change_me|dev_secret/i.test(secret)) throw new Error('Set JWT_SECRET to a random secret of at least 32 characters');
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required');
  const { client, origins } = settings();
  const base = origin(process.env.BASE_URL || 'http://localhost:5000', 'BASE_URL');
  if (process.env.TRUST_PROXY && !/^\d+$/.test(process.env.TRUST_PROXY)) throw new Error('TRUST_PROXY must be a non-negative hop count');
  if (process.env.NODE_ENV === 'production') {
    if (![client, base, ...origins].every(v => v.startsWith('https://'))) throw new Error('Production origins must use HTTPS');
    if (!process.env.SMTP_HOST || !process.env.MAIL_FROM) throw new Error('Configure SMTP_HOST and MAIL_FROM for account emails');
  }
}
module.exports = { settings, validateEnv };
