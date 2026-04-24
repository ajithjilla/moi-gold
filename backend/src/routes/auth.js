const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");

const prisma = require("../lib/prisma");
const env = require("../lib/env");
const { authenticate } = require("../middleware/auth");
const asyncHandler = require("../lib/asyncHandler");
const { validate } = require("../lib/validate");
const { loginSchema, changePasswordSchema, updateProfileSchema } = require("../lib/schemas");
const { unauthorized, badRequest } = require("../lib/errors");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.LOGIN_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts, please try again later" },
});

const signToken = (userId) =>
  jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

const safeUser = (user) => ({
  id: user.id,
  name: user.name,
  phone: user.phone,
  email: user.email,
  role: user.role,
  active: user.active,
  affiliate: user.affiliate
    ? {
        id: user.affiliate.id,
        plan: user.affiliate.plan,
        status: user.affiliate.status,
        revenue: user.affiliate.revenue,
      }
    : null,
});

router.post(
  "/login",
  loginLimiter,
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { phone, email, password } = req.body;
    const user = await prisma.user.findFirst({
      where: phone ? { phone } : { email },
      include: { affiliate: true },
    });
    if (!user) throw unauthorized("Invalid credentials");
    if (!user.active) throw unauthorized("Account disabled");

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw unauthorized("Invalid credentials");

    const token = signToken(user.id);
    res.json({ token, user: safeUser(user) });
  })
);

router.get("/me", authenticate, (req, res) => {
  res.json({ user: safeUser(req.user) });
});

router.patch(
  "/profile",
  authenticate,
  validate(updateProfileSchema),
  asyncHandler(async (req, res) => {
    const { name, email, phone } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(email !== undefined && { email: email || null }),
        ...(phone && { phone }),
      },
      include: { affiliate: true },
    });
    res.json({ user: safeUser(user) });
  })
);

router.patch(
  "/password",
  authenticate,
  validate(changePasswordSchema),
  asyncHandler(async (req, res) => {
    const { current_password, new_password } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const ok = await bcrypt.compare(current_password, user.password_hash);
    if (!ok) throw badRequest("Current password is incorrect");
    const password_hash = await bcrypt.hash(new_password, env.BCRYPT_ROUNDS);
    await prisma.user.update({ where: { id: user.id }, data: { password_hash } });
    res.json({ message: "Password changed" });
  })
);

router.post("/logout", authenticate, (_req, res) => {
  // Stateless JWT; client drops token.
  res.json({ message: "Logged out" });
});

module.exports = router;
