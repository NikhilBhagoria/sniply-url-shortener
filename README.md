# Sniply — URL Shortener & Click Analytics

A full-stack **MERN** URL shortener. Users shorten long URLs (with optional custom slugs), share them, and get a live analytics dashboard — total clicks, clicks over time, and breakdowns by device, browser, and referrer. **Analytics are generated automatically from real redirect traffic — no manual data entry.**

## Tech Stack

- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT auth, bcrypt, nanoid, ua-parser-js
- **Frontend**: React (Vite), React Router DOM, Axios, Tailwind CSS, Recharts
- **Tooling**: GitHub Actions CI

## Features

- JWT auth (register / login), hashed passwords, protected routes, per-user data isolation
- Shorten URLs with auto-generated or **custom slugs** (validated + uniqueness-checked)
- Public redirect endpoint that logs each click **asynchronously** (device, browser, OS, referrer) without slowing the redirect
- Per-link analytics via **MongoDB aggregation pipelines**: clicks-over-time timeline, device/browser/referrer breakdowns
- Account-level summary (total links, total clicks, avg clicks/link, top links)
- Link list with **keyword search** and **pagination**
- Centralized error handling and input validation

## How the analytics work

Every visit to `GET /:slug` does three things: looks up the link, atomically `$inc`s its click counter, and writes a `Click` event (parsed from the User-Agent + referrer). The dashboard then runs aggregation pipelines over those `Click` documents to build the charts. Because the data comes from actual traffic, the dashboard fills itself in as your links get used.

## Project Structure

```
sniply/
├── backend/
│   ├── config/db.js
│   ├── models/            User.js, Link.js, Click.js
│   ├── middleware/        auth.js, errorHandler.js
│   ├── controllers/       authController.js, linkController.js, redirectController.js
│   ├── routes/            authRoutes.js, linkRoutes.js
│   ├── utils/token.js
│   └── server.js
├── frontend/
│   └── src/
│       ├── api/axios.js
│       ├── context/AuthContext.jsx
│       ├── components/     Navbar, ProtectedRoute, StatCard, BarBlock, TimelineChart
│       └── pages/          Login, Register, Dashboard, LinkStats
└── .github/workflows/ci.yml
```

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB connection string (free tier: [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Backend
```bash
cd backend
cp .env.example .env      # fill in MONGO_URI and JWT_SECRET
npm install
npm run dev               # http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
cp .env.example .env      # defaults point at the local backend
npm install
npm run dev               # http://localhost:5173
```

Register an account, shorten a URL, open the short link in a few browsers/devices, then click **Stats** to watch the analytics populate.

## API Reference

Base URL: `/api/v1` (all `/links` and `/auth/me` routes require `Authorization: Bearer <token>`)

| Method | Endpoint               | Auth | Description                                        |
|--------|------------------------|------|----------------------------------------------------|
| POST   | `/auth/register`       | No   | Create account, returns JWT                        |
| POST   | `/auth/login`          | No   | Log in, returns JWT                                |
| GET    | `/auth/me`             | Yes  | Current user                                       |
| GET    | `/links`               | Yes  | List links (`search`, `page`, `limit`)             |
| POST   | `/links`               | Yes  | Create short link (`originalUrl`, `title?`, `slug?`) |
| DELETE | `/links/:id`           | Yes  | Delete a link and its click events                 |
| GET    | `/links/:id/stats`     | Yes  | Aggregated analytics for one link                  |
| GET    | `/links/summary`       | Yes  | Account-wide totals + top links                    |
| GET    | `/:slug`               | No   | Public redirect (logs a click event)               |

### Example
```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Nikhil","email":"nikhil@example.com","password":"secret123"}'

# Shorten a URL (use the returned token)
curl -X POST http://localhost:5000/api/v1/links \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"originalUrl":"https://example.com/some/really/long/path","slug":"demo"}'

# Visit the short link (this records a click)
curl -L http://localhost:5000/demo
```

## Deployment Notes

- **Backend**: Render or Railway (start command `npm start`, set all env vars). Set `BASE_URL` to the deployed backend origin.
- **Frontend**: Vercel or Netlify. Set `VITE_API_URL` to `<backend>/api/v1` and `VITE_SHORT_BASE` to the backend origin.
- Set `CLIENT_URL` in the backend env to the deployed frontend origin for CORS.

## Possible Next Steps

- Geo/IP-based location analytics
- QR code generation per short link
- Rate limiting on auth and shorten endpoints
- Unit/integration tests (Vitest + Supertest / React Testing Library)
- Link expiry dates and password-protected links
