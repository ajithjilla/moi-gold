# Prisma engines expect glibc + OpenSSL 3 — use Debian slim, not Alpine (musl).
# See: https://www.prisma.io/docs/orm/reference/system-requirements

FROM node:20-bookworm-slim AS deps
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
# Include devDependencies so `prisma` CLI is available for generate / db push
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

FROM node:20-bookworm-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src
COPY prisma ./prisma

EXPOSE 4000

# No committed migrations yet — `db push` syncs schema. Switch to `migrate deploy`
# after you add prisma/migrations (e.g. `npx prisma migrate dev` locally).
# Use --force-reset to clear DB on schema incompatibility (safe for fresh Docker builds + seed).
CMD ["sh", "-c", "npx prisma db push --force-reset && node src/index.js"]
