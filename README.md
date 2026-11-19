# Sniply — URL Shortener & Click Analytics

React/Vite frontend, Express API, and MongoDB. No Redis dependency.

## Implemented

- Registration/login; bcrypt passwords; versioned JWT sessions and owner-scoped link access.
- Email verification, single-use password resets, and current-password-verified password changes.
- Seven-character NanoID slugs and custom aliases. Database uniqueness and up to three generated-code save attempts.
- HTTP(S) URL validation, reserved aliases, expiry, optional hashed link passwords.
- Link editing, pause/resume, and last-50 change history (field names/time only).
- Literal search, sort, status filters, and pagination.
- Daily UTC analytics with zero-filled dates and CSV export. Default 30 dates; maximum 366.
- QR design controls/download and a UTM builder in the shared link editor.
- Named API keys with hashed storage, read/write scopes, expiry, revocation and last-used time.
- MongoDB-backed per-key quota (60/minute). General/auth IP limits remain in-process.
- Profile/company/timezone persistence; accessible native link dialogs; lazy-loaded pages.
- Helmet, explicit CORS origins, body limits, generic server errors, request IDs and structured logs.
- Local Docker Compose, MongoDB readiness checks, local Mailpit inbox, and CI test/build/container jobs.

Email verification is available from Settings; it does not gate link creation. Changing email requires the current password and clears verification. Password changes/resets and email changes invalidate prior JWTs and API keys. A successful email/profile update returns a new session token.

## Local development

Use Node **22.12+** (Node 22 is used in CI and Docker) and MongoDB.

1. Copy backend/.env.example to backend/.env. Set MONGO_URI and generate JWT_SECRET:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
2. Run npm ci and npm run dev in backend.
3. Copy frontend/.env.example to frontend/.env. Run npm ci and npm run dev in frontend.
4. Configure SMTP to send account emails. For a local inbox, run Mailpit with SMTP on port 1025 and its UI on port 8025, or use Compose below.

Never put secrets in VITE_* variables; frontend values are public.

## Local Docker stack

Copy root .env.example to .env and set a generated JWT_SECRET, then run:

    docker compose up --build --wait

- Frontend: http://localhost:5173
- API readiness: http://localhost:5000/api/ready
- Swagger: http://localhost:5000/api/docs
- Captured local emails: http://localhost:8025

MongoDB is internal to Compose and persists in mongo-data. Mailpit captures local messages; it does not deliver them to real inboxes. Host ports bind to loopback. This Compose file is explicitly for local development, not a hardened public deployment.

Stop with docker compose down. Do not remove the named volume unless you intend to delete its database.

## API

Private base: /api/v1. Use Authorization: Bearer <JWT-or-API-key>.
Account/key administration accepts session JWTs only.

| Method | Path | Purpose |
|---|---|---|
| POST | /auth/register, /auth/login | Account access |
| GET / PUT | /auth/me | Read/update profile |
| POST | /auth/forgot-password | Request reset email |
| POST | /auth/reset-password | Consume reset token |
| POST | /auth/request-verification | Request verification email |
| POST | /auth/verify-email | Consume verification token |
| POST | /auth/change-password | Verify current password and change it |
| GET / POST | /keys | List metadata / create key |
| DELETE | /keys/:id | Revoke key |
| GET / POST | /links | Search/list / create |
| PATCH / DELETE | /links/:id | Edit/pause / delete |
| GET | /links/summary | Lifetime totals, active/paused counts |
| GET | /links/:id/stats | Date-filtered events |
| GET | /links/:id/stats/export | CSV daily counts |
| GET | /links/:id/qr | PNG data URL |
| POST | /unlock/:slug | Public password verification |

Public GET /:slug lives outside /api/v1 and returns 302. Missing/expired/paused links redirect to a frontend explanation. Protected links redirect to an unlock form. Password protection gates the short link, not access to an already-known destination.

Date parameters: from=2026-01-01&to=2026-01-31 (inclusive UTC dates).
List parameters: search, page, limit, status=all|active|paused|expired, sort=createdAt|clicks|title, order=asc|desc.

## Tests

Backend:

    cd backend
    npm ci
    npm test

These tests start a disposable real MongoDB using mongodb-memory-server; they do not connect to backend/.env or use the application's database. The first run downloads a MongoDB binary.

Email transport tests also start a loopback-only SMTP sink and verify actual Nodemailer delivery/rejection. They do not relay email to real recipients. Hosted SMTP/TLS delivery still needs provider-specific verification.

Browser tests (install backend dependencies first):

    cd frontend
    npm ci
    npx playwright install chromium
    npm run test:e2e
    npm run build

Browser tests start isolated services on loopback ports 5055 and 5175, capture synthetic emails locally, and never contact an SMTP provider. The test-only outbox is in backend/tests/e2e-server.js; production app.js does not expose it.

GitHub Actions runs backend tests, frontend build, Chromium flows, and a separate Compose smoke job.

## Configuration and deployment

See docs/DEPLOYMENT.md for origins, proxy/SMTP settings, deployment checks and backup/restore instructions.

Old JWTs issued before the versioned-token change are intentionally rejected. Users must sign in again. Existing user records receive default tokenVersion/emailVerified values through Mongoose.

## Known boundaries

- Click event and counter writes remain independent/best effort; failures are logged. Counts are visits, not unique people.
- Deletion of a link and its click events is not transactional; a concurrent analytics write can leave an orphan event.
- General/auth IP limits are per-process. API-key quotas use MongoDB and are shared across instances.
- JWTs remain in localStorage. No refresh-token or server-managed browser-cookie session system is claimed.
- QR appearance settings are not persisted and arbitrary color combinations are not guaranteed scannable.
- No geo analytics, teams, billing, custom domains or Redis caching.
- Adding headers/validation is not a complete phishing or abuse-moderation system.
- Historical credential rotation and remote Git-history remediation require account-owner action; source changes do not revoke credentials.
