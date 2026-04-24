const express = require("express");
const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
const env = require("../lib/env");
const { authenticate, requireRole } = require("../middleware/auth");
const asyncHandler = require("../lib/asyncHandler");
const { validate } = require("../lib/validate");
const { createUserSchema, updateUserSchema } = require("../lib/schemas");
const { badRequest, conflict } = require("../lib/errors");

const router = express.Router();

router.get(
  "/lookup",
  authenticate,
  requireRole("AFFILIATE", "ADMIN"),
  asyncHandler(async (req, res) => {
    const { phone } = req.query;
    if (!phone) throw badRequest("phone query param required");
    const user = await prisma.user.findUnique({
      where: { phone },
      select: { id: true, name: true, phone: true, email: true, role: true, active: true },
    });
    if (!user) return res.json({ found: false });
    res.json({ found: true, user });
  })
);

router.get(
  "/",
  authenticate,
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const { role, q } = req.query;
    const users = await prisma.user.findMany({
      where: {
        ...(role ? { role } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { phone: { contains: q } },
                { email: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      select: {
        id: true, name: true, phone: true, email: true, role: true, active: true, created_at: true,
      },
      orderBy: { created_at: "desc" },
      take: 500,
    });
    res.json(users);
  })
);

router.post(
  "/",
  authenticate,
  requireRole("AFFILIATE", "ADMIN"),
  validate(createUserSchema),
  asyncHandler(async (req, res) => {
    const { name, phone, email, password } = req.body;
    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      throw conflict("Phone already in use", {
        user: { id: existing.id, name: existing.name, phone: existing.phone },
      });
    }
    const rawPassword = password || phone;
    const password_hash = await bcrypt.hash(rawPassword, env.BCRYPT_ROUNDS);
    const user = await prisma.user.create({
      data: { name, phone, email: email || null, password_hash, role: "USER" },
      select: { id: true, name: true, phone: true, email: true, role: true, active: true },
    });
    res.status(201).json(user);
  })
);

router.patch(
  "/:id",
  authenticate,
  requireRole("ADMIN"),
  validate(updateUserSchema),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: req.body,
      select: { id: true, name: true, phone: true, email: true, role: true, active: true },
    });
    res.json(user);
  })
);

router.post(
  "/:id/reset-password",
  authenticate,
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: "User not found" });
    const newPass = req.body?.password || user.phone;
    const password_hash = await bcrypt.hash(newPass, env.BCRYPT_ROUNDS);
    await prisma.user.update({ where: { id: user.id }, data: { password_hash } });
    res.json({ message: "Password reset", temporary_password: newPass });
  })
);

module.exports = router;
