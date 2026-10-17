const errorResponses = {
  400: { description: 'Invalid input' }, 401: { description: 'Authentication required or expired' },
  403: { description: 'Origin or permission denied' }, 404: { description: 'Not found or not owned by this account' },
  409: { description: 'Duplicate slug/email or concurrent update' }, 429: { description: 'Request limit exceeded' },
  500: { description: 'Unexpected failure; details are not exposed' },
};
const text = { type: 'string' };
const password = { type: 'string', minLength: 8, maxLength: 72, description: 'Maximum 72 UTF-8 bytes; passwords are not trimmed' };
const body = (properties, required = []) => ({ required: true, content: { 'application/json': { schema: { type: 'object', properties, required } } } });
const id = { name: 'id', in: 'path', required: true, schema: text };
const query = (name, schema = text) => ({ name, in: 'query', schema });
const result = (description, status = 200) => ({ [status]: { description }, ...errorResponses });
const op = (summary, extra = {}, status = 200) => ({ summary, responses: result('Success', status), ...extra });
const linkFields = { originalUrl: { ...text, maxLength: 2048 }, title: { ...text, maxLength: 200 }, expiresAt: { type: 'string', format: 'date-time', nullable: true }, password: { ...password, nullable: true }, isPaused: { type: 'boolean' } };
const dates = [query('from', { type: 'string', format: 'date' }), query('to', { type: 'string', format: 'date' }), query('interval', { type: 'string', enum: ['day', 'week'], default: 'day' })];
module.exports = {
  openapi: '3.0.3', info: { title: 'Sniply API', version: '1.1.0', description: 'JWTs or scoped API keys authenticate link operations. Account/key management requires a JWT. API keys are limited to 60 requests/minute; the general IP limit also applies. Analytics default to the last 30 UTC dates, maximum 366 dates. Email verification is available but does not gate existing link features.' },
  servers: [{ url: '/api/v1' }],
  components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', description: 'Session JWT or snip_ API key' } } },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/register': { post: op('Create account (8+ character password)', { security: [], requestBody: body({ name: text, email: { type: 'string', format: 'email' }, password }, ['name', 'email', 'password']) }, 201) },
    '/auth/login': { post: op('Sign in', { security: [], requestBody: body({ email: text, password: text }, ['email', 'password']) }) },
    '/auth/me': {
      get: op('Read current account (JWT only)'),
      put: op('Update profile (JWT only)', { description: 'Email changes require currentPassword, clear verification, and invalidate prior sessions/API keys. Returns an updated JWT and user.', requestBody: body({ name: text, email: text, company: text, timezone: text, currentPassword: text }) }),
    },
    '/auth/forgot-password': { post: op('Request reset email', { security: [], description: 'Same response for known and unknown accounts; reset links expire after 30 minutes.', requestBody: body({ email: text }, ['email']) }) },
    '/auth/reset-password': { post: op('Consume reset token', { security: [], description: 'Single use. Invalidates prior sessions and API keys.', requestBody: body({ token: text, password }, ['token', 'password']) }) },
    '/auth/request-verification': { post: op('Send verification email (JWT only)', { description: 'Verification links expire after 24 hours. Returns 503 if sending fails.', responses: { ...result('Email sent'), 503: { description: 'Email unavailable' } } }) },
    '/auth/verify-email': { post: op('Consume verification token', { security: [], requestBody: body({ token: text }, ['token']) }) },
    '/auth/change-password': { post: op('Change password (JWT only)', { description: 'Invalidates all existing sessions and API keys, including the current session.', requestBody: body({ currentPassword: text, password }, ['currentPassword', 'password']) }) },
    '/keys': {
      get: op('List key metadata (JWT only; never returns secret/hash)'),
      post: op('Create API key (JWT only)', { description: 'Full token is returned once.', requestBody: body({ name: text, days: { type: 'integer', minimum: 1, maximum: 365, default: 30 }, scopes: { type: 'array', minItems: 1, items: { type: 'string', enum: ['links:read', 'links:write'] } } }, ['name', 'scopes']) }, 201),
    },
    '/keys/{id}': { delete: op('Revoke own API key (JWT only)', { parameters: [id] }) },
    '/links': {
      get: op('List owned links', { parameters: [query('search'), query('page', { type: 'integer', minimum: 1 }), query('limit', { type: 'integer', minimum: 1, maximum: 50 }), query('status', { type: 'string', enum: ['all', 'active', 'paused', 'expired'] }), query('sort', { type: 'string', enum: ['createdAt', 'clicks', 'title'] }), query('order', { type: 'string', enum: ['asc', 'desc'] })] }),
      post: op('Create short link', { requestBody: body({ ...linkFields, slug: { type: 'string', pattern: '^[a-zA-Z0-9_-]{3,30}$' } }, ['originalUrl']) }, 201),
    },
    '/links/summary': { get: op('Lifetime counters, active/paused totals, top five links') },
    '/links/{id}': {
      patch: op('Edit owned link', { parameters: [id], description: 'Slug is immutable. Empty/null password removes protection; omit to preserve it. Expiry may be cleared with null. Stores the last 50 change field lists, without secret values.', requestBody: body(linkFields) }),
      delete: op('Delete owned link and its events', { parameters: [id] }),
    },
    '/links/{id}/stats': { get: op('UTC date-filtered recorded click events', { parameters: [id, ...dates], description: 'Returns daily or Monday-based weekly timeline (edge weeks clipped to selected dates), browser/device/referrer/operatingSystems counts and percentages, estimatedUniqueVisitors with visitorTrackedClicks coverage, averageLinkAgeMs with linkAgeSamples, and comparison against the preceding equal-length UTC period. percentChange is null when the previous period has zero clicks. Visitor estimates use a per-link keyed IP/UA hash, not verified people. Average link age measures creation-to-click duration, not viewing time. Historical events without these fields are excluded from these two metrics.' }) },
    '/links/{id}/stats/export': { get: op('Export daily or weekly UTC counts as CSV', { parameters: [id, ...dates], responses: { ...errorResponses, 200: { description: 'CSV with date_utc,clicks (daily) or week_start_utc,clicks (weekly); includes zero-click buckets', content: { 'text/csv': { schema: text } } } } }) },
    '/links/{id}/qr': { get: op('Generate QR PNG data URL', { parameters: [id, query('dark'), query('light'), query('width', { type: 'integer', minimum: 100, maximum: 1000 }), query('margin', { type: 'integer', minimum: 0, maximum: 10 })] }) },
    '/unlock/{slug}': { post: op('Unlock a public password-protected link', { security: [], parameters: [{ name: 'slug', in: 'path', required: true, schema: text }], requestBody: body({ password: text }, ['password']), responses: { ...result('Destination URL'), 410: { description: 'Paused or expired link' } } }) },
    '/{slug}': { get: op('Public short-link redirect', { servers: [{ url: '/' }], security: [], parameters: [{ name: 'slug', in: 'path', required: true, schema: text }], responses: { 302: { description: 'Destination, unlock form, or unavailable-link explanation' }, 500: { description: 'Lookup failed' } } }) },
  },
};
