# Moi Gold — Backend API

Node.js + Express + Prisma + PostgreSQL

## Setup

### 1. Prerequisites
- Node.js 18+
- PostgreSQL running locally (or use a hosted service like Railway/Supabase)

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env and set your DATABASE_URL and JWT_SECRET
```

### 3. Install dependencies
```bash
npm install
```

### 4. Run database migrations
```bash
npx prisma migrate dev --name init
```

### 5. Seed demo data
```bash
npm run db:seed
```
This creates:
- Admin:      phone=9000000000  password=admin123
- Affiliate:  phone=9811234567  password=ravi123
- Writer 1:   phone=9876500001  password=writer123
- Writer 2:   phone=9876500002  password=writer123

### 6. Start the server
```bash
npm run dev       # development (nodemon)
npm start         # production
```
Server runs on http://localhost:4000

---

## Docker

From the **repository root** (not `backend/`):

```bash
docker compose up -d --build
```

Wait until the backend is **Up** (check with `docker compose ps`). Then seed **once**:

```bash
docker compose exec backend node src/lib/seed.js
```

### `service "backend" is not running`

`exec` only works while the backend container is running. Do this:

1. Start the stack: `docker compose up -d`
2. Confirm: `docker compose ps` — backend should show `Up`, not `Exited`.
3. If backend exits or restarts, see logs: `docker compose logs -f backend`

**Seed without a long-running backend** (starts Postgres if needed, runs a one-off backend container):

```bash
docker compose up -d postgres
sleep 5
docker compose run --rm backend node src/lib/seed.js
```

The backend image uses **Node 20 on Debian Bookworm slim** (not Alpine). Prisma’s native engine needs OpenSSL/glibc; Alpine (musl) often triggers `Could not parse schema engine response` / OpenSSL warnings.

The container runs `prisma db push` on startup to sync the schema (there is no `prisma/migrations` folder yet). After you add migrations locally, you can change the backend `Dockerfile` `CMD` to `npx prisma migrate deploy && node src/index.js`.

---

## API Overview

| Group | Base path |
|---|---|
| Auth | `/api/auth` |
| Users | `/api/users` |
| Admin | `/api/admin` |
| Affiliate events & writers | `/api/affiliate` |
| Moi entries | `/api/events/:id/moi` |
| Settlement / Reports | `/api/events/:id/settlement` `/api/events/:id/report` |
| Writer limited view | `/api/writer` |

All protected routes require: `Authorization: Bearer <JWT>`

---

## Role Access

| Role | Can access |
|---|---|
| ADMIN | Everything |
| AFFILIATE | Own events, writers, moi entries, settlement, reports |
| USER (writer) | Only assigned events; can add moi only when `writer_access_enabled = true` |
