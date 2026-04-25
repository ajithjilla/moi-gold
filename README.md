# Moi Tech — Digital Gift Tracking for Tamil Nadu Functions

A production-ready full-stack application for managing Moi (gift cash) at weddings, engagements, ear-piercings, housewarmings and similar functions.

- **Backend**: Node.js + Express + Prisma + PostgreSQL
- **Frontend**: React 19 + Vite + React Router
- **Infra**: Docker Compose (Postgres + backend + nginx-served frontend)

## Highlights

- Role-based access: **Admin**, **Affiliate**, **Writer** (USER), public event share link
- Full event lifecycle: create events, assign writers, record Moi entries with denominations, void/restore, settlement breakdown, CSV export
- Public, tokenised owner view (`/share/:token`) with live auto-refresh
- Hardened backend: JWT auth, bcrypt hashing, helmet, rate limiting, compression, Zod validation, centralised error handling, graceful shutdown
- Prisma schema includes Settings and Audit log models
- Admin dashboard: affiliate management, revenue charts, plans catalog, system settings, audit log

## Quick start (Docker)

```bash
cp backend/.env.example backend/.env      # fill in JWT_SECRET etc.
# edit .env vars — at minimum set a 32+ character JWT_SECRET
export JWT_SECRET="$(openssl rand -hex 32)"
docker compose down -v   
docker compose up --build
```

Services:

- Postgres → `localhost:5432`
- Backend API → `http://localhost:4000`
- Frontend → `http://localhost:5173`

First-time DB seed (demo users + settings):

```bash
docker compose exec backend node src/lib/seed.js
```

## Demo accounts

| Role       | Phone        | Password    |
|------------|--------------|-------------|
| Admin      | 9000000000   | admin123    |
| Affiliate  | 9811234567   | ravi123     |
| Writer     | 9876500001   | writer123   |

## Local development

```bash
# 1. Install deps
npm install
cd backend && npm install && cd ..

# 2. Start Postgres locally (or use docker compose up postgres)
# 3. Backend
cd backend
cp .env.example .env              # edit DATABASE_URL / JWT_SECRET
npx prisma db push
node src/lib/seed.js              # seed demo data
npm run dev

# 4. Frontend (in a new shell)
npm run dev                       # proxies /api to http://localhost:4000
```

## Environment variables (backend)

| Name                   | Default                     | Description                                    |
|------------------------|-----------------------------|------------------------------------------------|
| `NODE_ENV`             | `development`               | `production` enables strict validation         |
| `PORT`                 | `4000`                      | API port                                        |
| `DATABASE_URL`         | —                           | Postgres connection string                      |
| `JWT_SECRET`           | —                           | **≥ 32 chars** required in production           |
| `JWT_EXPIRES_IN`       | `7d`                        | JWT lifetime                                    |
| `FRONTEND_URL`         | `http://localhost:5173`     | CORS origin                                     |
| `BCRYPT_ROUNDS`        | `10`                        | 10–15 recommended                               |
| `RATE_LIMIT_WINDOW_MS` | `60000`                     | Global rate-limit window (ms)                   |
| `RATE_LIMIT_MAX`       | `300`                       | Requests per window per IP                      |
| `LOGIN_RATE_LIMIT_MAX` | `10`                        | Login attempts per 15 min per IP                |
| `TRUST_PROXY`          | `1`                         | Hops to trust (reverse proxies)                 |

## Available endpoints (summary)

Public:
- `GET /api/public/plans` — subscription plan list
- `GET /api/public/settings` — white-listed public settings
- `GET /api/public/events/shared/:token` — event owner's public Moi list

Auth:
- `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `PATCH /api/auth/profile`, `PATCH /api/auth/password`

Admin (ADMIN only):
- `GET /api/admin/stats`, `GET /api/admin/revenue-series`
- `GET/POST /api/admin/affiliates`, `PATCH/DELETE /api/admin/affiliates/:id`
- `GET /api/admin/events`
- `GET/PATCH /api/admin/settings`
- `GET /api/admin/audit`

Affiliate (AFFILIATE/ADMIN):
- `GET/POST /api/affiliate/events`, `GET/PATCH/DELETE /api/affiliate/events/:id`
- `PATCH /api/affiliate/events/:id/writer-access`
- `PATCH /api/affiliate/events/:id/share`, `POST /api/affiliate/events/:id/regenerate-share`
- `GET/POST /api/affiliate/events/:id/writers`, `PATCH/DELETE /api/affiliate/events/:id/writers/:writerId`

Moi entries:
- `GET/POST /api/events/:eventId/moi`, `PATCH /api/events/:eventId/moi/:entryId`
- `PATCH /api/events/:eventId/moi/:entryId/void`
- `PATCH /api/events/:eventId/moi/:entryId/restore`
- `DELETE /api/events/:eventId/moi/:entryId`

Reports:
- `GET /api/events/:eventId/settlement`
- `GET /api/events/:eventId/report`
- `GET /api/events/:eventId/export.csv`

Writer (USER):
- `GET /api/writer/events`, `GET /api/writer/events/:eventId`, `GET /api/writer/events/:eventId/stats`

## Scripts

Frontend:
- `npm run dev` — Vite dev server (proxies `/api` to `http://localhost:4000`)
- `npm run build` — Production bundle
- `npm run preview` — Preview the built bundle
- `npm run lint` — ESLint

Backend:
- `npm run dev` — `node --watch src/index.js`
- `npm start` — Production start
- `npm run db:push`, `npm run db:migrate`, `npm run db:migrate:deploy`
- `npm run db:seed`

## Project structure

```
backend/
  prisma/schema.prisma
  src/
    index.js                # Express app
    lib/                    # env, prisma, errors, validate, schemas, seed
    middleware/             # auth, errorHandler
    routes/                 # auth, users, admin, affiliate, moi, reports, writer, public
src/
  App.jsx                   # routing
  api/client.js             # fetch wrapper with typed endpoints
  components/               # shared UI + layout
  context/                  # Auth + Language
  locales/                  # en / ta JSON
  pages/
    admin/                  # Admin pages
    affiliate/              # Affiliate pages + EventDetail
    writer/                 # Writer pages
    public/                 # Shared event page (owner view)
  styles/main.css           # Design system
```

## License

Proprietary — © Moi Tech. All rights reserved.
