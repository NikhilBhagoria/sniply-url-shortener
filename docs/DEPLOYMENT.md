# Deployment and operations

## Required production configuration

- NODE_ENV=production
- MONGO_URI: authenticated managed MongoDB connection; never commit it.
- JWT_SECRET: random secret of at least 32 characters.
- CLIENT_URL: one HTTPS frontend origin, no path.
- CORS_ORIGINS: optional comma-separated HTTPS origins. Defaults to CLIENT_URL.
- BASE_URL: HTTPS origin where GET /:slug is served.
- TRUST_PROXY: exact trusted reverse-proxy hop count, default 0.
- SMTP_HOST, SMTP_PORT, SMTP_SECURE, MAIL_FROM and provider SMTP credentials as needed.
- SMTP_SECURE=true means implicit TLS (typically port 465); port 587 normally uses STARTTLS.
- VITE_API_URL=<backend>/api/v1 and VITE_SHORT_BASE=<backend>, supplied when building the frontend.

Use your hosting provider's secret storage. Do not pass backend secrets to a frontend build. The backend exits before listening when required production origins/secrets/email settings are absent or invalid. Settings validation cannot prove SMTP delivery or credential strength.

The local Compose file uses Mailpit and development HTTP origins. Do not publish that stack unchanged. Put production behind HTTPS, keep MongoDB private, and restrict infrastructure access. No production hosting target has been configured by these changes.

## Checks before release

Run `npm run check:config` from backend to validate environment settings without starting the application, connecting to MongoDB, or sending email. It prints no environment values. Passing this check validates configuration syntax/policy, not connectivity or delivery.

1. Run backend tests and frontend build/browser tests.
2. Set production environment values, run `npm run check:config`, and test SMTP using your own account.
3. Check /api/health (process is running) and /api/ready (database connection ready).
4. Register, create, visit, pause/resume, edit and delete a disposable demo link.
5. Verify another account cannot access that link's management endpoints.
6. Check email verification, reset expiry/replay rejection and old-session invalidation.
7. Exercise date filters/CSV, key scopes, expiry, revocation and quotas.
8. Confirm reloads of frontend routes are served through index.html.
9. Confirm data survives a restart and a backup can be restored.

CI contains a local Compose smoke job. A passing local build or API test is not evidence of a successful public deployment.

## Limits and observability

General API: 300 requests/IP/15 minutes. Auth routes share 30/IP/15 minutes. Unlock has its own 30/IP/15-minute limiter. Health checks are exempt.

These IP limits use process memory, so multiple instances each maintain their own counts. API keys additionally use MongoDB-backed fixed-minute quotas of 60 requests/key. Revocation is checked on subsequent requests; already-started requests may complete.

Each request gets an X-Request-ID. Logs include method, status and duration; they do not include query strings, passwords, bearer tokens or reset links. Analytics failures log a link/request ID. Forward logs to the hosting provider's log collector and alert on sustained 5xx/health failures.

Reset links expire after 30 minutes and verification links after 24 hours. Tokens are hashed in MongoDB and delivered in URL fragments to avoid access-log leakage. Configure the email provider appropriately for delivery and sender authentication.

## Backup and restore

For hosted MongoDB, enable provider-managed backups and test restoration into a separate database. Document the recovery time and accepted data-loss window.

For the local Compose database, these commands use MongoDB tools inside the container:

    docker compose exec mongo mongodump --db sniply --archive=/tmp/sniply-backup.archive --gzip
    docker compose cp mongo:/tmp/sniply-backup.archive ./sniply-backup.archive

Restore into a separate test database, never over the live one:

    docker compose cp ./sniply-backup.archive mongo:/tmp/sniply-backup.archive
    docker compose exec mongo mongorestore --archive=/tmp/sniply-backup.archive --gzip --nsFrom="sniply.*" --nsTo="sniply_restore_test.*"

Verify collection counts and sample documents in sniply_restore_test. Backups contain sensitive account/link data: restrict access and keep them out of Git. The restore procedure is documented, not claimed to have been executed on this machine.

## Existing credential history

Prior analysis found credential-bearing MongoDB connection strings in reachable history. This implementation does not rewrite Git history, revoke database credentials or force-push anything. Rotate/revoke affected credentials through their provider, then coordinate repository-history cleanup separately. Replacing the current example file is not historical remediation.
