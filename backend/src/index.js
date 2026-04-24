require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

const env = require("./lib/env");
const prisma = require("./lib/prisma");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");
const affiliateRoutes = require("./routes/affiliate");
const moiRoutes = require("./routes/moi");
const reportsRoutes = require("./routes/reports");
const writerRoutes = require("./routes/writer");
const publicRoutes = require("./routes/public");

const app = express();

app.set("trust proxy", env.TRUST_PROXY);
app.disable("x-powered-by");

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  })
);
app.use(compression());

const corsOrigins = env.FRONTEND_URL === "*" ? true : env.FRONTEND_URL.split(",").map((s) => s.trim());
app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.use(express.json({ limit: "1mb" }));

if (env.NODE_ENV !== "test") {
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
}

const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests" },
});
app.use("/api/", globalLimiter);

// ─── Health ────────────────────────────────────────────────
app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "ok", uptime: process.uptime() });
  } catch (e) {
    res.status(503).json({ status: "degraded", db: "down", error: e.message });
  }
});

app.get("/api/version", (_req, res) =>
  res.json({ name: "moi-gold-api", version: require("../package.json").version })
);

// ─── Routes ────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/affiliate", affiliateRoutes);
app.use("/api/events/:eventId/moi", moiRoutes);
app.use("/api/events/:eventId", reportsRoutes);
app.use("/api/writer", writerRoutes);
app.use("/api/public", publicRoutes);

// ─── 404 & error handling ──────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(env.PORT, () =>
  console.log(`Moi Gold API running in ${env.NODE_ENV} on :${env.PORT}`)
);

const shutdown = async (signal) => {
  console.log(`\n${signal} received, shutting down…`);
  server.close(() => {
    prisma.$disconnect().finally(() => process.exit(0));
  });
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

module.exports = app;
