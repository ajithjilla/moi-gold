const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const { unauthorized, forbidden } = require("../lib/errors");
const env = require("../lib/env");

const authenticate = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) return next(unauthorized("No token provided"));

    const token = header.slice(7);
    let payload;
    try {
      payload = jwt.verify(token, env.JWT_SECRET);
    } catch {
      return next(unauthorized("Invalid or expired token"));
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { affiliate: true },
    });
    if (!user) return next(unauthorized("User not found"));
    if (user.active === false) return next(forbidden("Account has been disabled"));

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user) return next(unauthorized());
  if (!roles.includes(req.user.role)) return next(forbidden());
  next();
};

module.exports = { authenticate, requireRole };
