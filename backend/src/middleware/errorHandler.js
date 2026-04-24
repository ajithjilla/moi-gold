const { HttpError } = require("../lib/errors");
const { Prisma } = require("@prisma/client");

const notFoundHandler = (_req, res) => res.status(404).json({ error: "Route not found" });

const errorHandler = (err, req, res, _next) => {
  if (res.headersSent) return;

  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const field = Array.isArray(err.meta?.target) ? err.meta.target.join(", ") : "field";
      return res.status(409).json({ error: `${field} already in use` });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Record not found" });
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({ error: "Invalid data supplied" });
  }

  if (err?.type === "entity.parse.failed" || err instanceof SyntaxError) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  const isProd = process.env.NODE_ENV === "production";
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} →`, err);

  res.status(500).json({
    error: isProd ? "Internal server error" : err.message || "Internal server error",
  });
};

module.exports = { errorHandler, notFoundHandler };
