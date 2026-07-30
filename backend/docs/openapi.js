module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Sniply API',
    version: '1.0.0',
    description: 'URL shortener with click analytics, link expiry, password protection, and QR codes.',
  },
  servers: [{ url: '/api/v1' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      Link: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          originalUrl: { type: 'string' },
          slug: { type: 'string' },
          shortUrl: { type: 'string' },
          title: { type: 'string' },
          clicks: { type: 'integer' },
          expiresAt: { type: 'string', format: 'date-time', nullable: true },
          isProtected: { type: 'boolean' },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/register': { post: { summary: 'Register', security: [], requestBody: body(['name', 'email', 'password']), responses: ok() } },
    '/auth/login': { post: { summary: 'Login', security: [], requestBody: body(['email', 'password']), responses: ok() } },
    '/auth/me': { get: { summary: 'Current user', responses: ok() } },
    '/links': {
      get: { summary: 'List links', parameters: [q('search'), q('page'), q('limit')], responses: ok() },
      post: {
        summary: 'Create short link',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['originalUrl'],
            properties: {
              originalUrl: { type: 'string' }, title: { type: 'string' }, slug: { type: 'string' },
              expiresAt: { type: 'string', format: 'date-time' }, password: { type: 'string' },
            } } } },
        },
        responses: { 201: ref() },
      },
    },
    '/links/summary': { get: { summary: 'Account summary', responses: ok() } },
    '/links/{id}/stats': { get: { summary: 'Link analytics', parameters: [p('id')], responses: ok() } },
    '/links/{id}/qr': { get: { summary: 'QR code (PNG data URL)', parameters: [p('id')], responses: ok() } },
    '/links/{id}': { delete: { summary: 'Delete link', parameters: [p('id')], responses: ok() } },
    '/unlock/{slug}': {
      post: {
        summary: 'Unlock a password-protected link', security: [], parameters: [p('slug')],
        requestBody: body(['password']), responses: ok(),
      },
    },
  },
};

function body(fields) {
  const properties = {};
  fields.forEach((f) => (properties[f] = { type: 'string' }));
  return { required: true, content: { 'application/json': { schema: { type: 'object', required: fields, properties } } } };
}
function ok() { return { 200: { description: 'Success' } }; }
function ref() { return { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Link' } } } }; }
function q(name) { return { name, in: 'query', schema: { type: 'string' } }; }
function p(name) { return { name, in: 'path', required: true, schema: { type: 'string' } }; }
