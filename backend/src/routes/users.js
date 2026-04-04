const express = require("express");
const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

// GET /api/users/lookup?phone=xxx  — used by affiliates to find a writer by phone
router.get("/lookup", authenticate, requireRole("AFFILIATE", "ADMIN"), async (req, res) => {
  const { phone } = req.query;
  if (!phone) return res.status(400).json({ error: "phone query param required" });
  try {
    const user = await prisma.user.findUnique({
      where: { phone },
      select: { id: true, name: true, phone: true, email: true, role: true },
    });
    if (!user) return res.json({ found: false });
    res.json({ found: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users  — Admin only
router.get("/", authenticate, requireRole("ADMIN"), async (req, res) => {
  const { role } = req.query;
  try {
    const users = await prisma.user.findMany({
      where: role ? { role } : undefined,
      select: { id: true, name: true, phone: true, email: true, role: true, created_at: true },
      orderBy: { created_at: "desc" },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users  — Affiliate or Admin creates a user (for writer assignment)
router.post("/", authenticate, requireRole("AFFILIATE", "ADMIN"), async (req, res) => {
  const { name, phone, email, password } = req.body;
  if (!name || !phone) return res.status(400).json({ error: "name and phone are required" });
  try {
    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) return res.status(409).json({ error: "Phone already in use", user: { id: existing.id, name: existing.name, phone: existing.phone } });
    const rawPassword = password || phone; // default password = phone number
    const password_hash = await bcrypt.hash(rawPassword, 10);
    const user = await prisma.user.create({
      data: { name, phone, email: email || null, password_hash, role: "USER" },
      select: { id: true, name: true, phone: true, email: true, role: true },
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/users/:id  — Admin updates user
router.patch("/:id", authenticate, requireRole("ADMIN"), async (req, res) => {
  const { name, phone, email, role } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(email !== undefined && { email: email || null }),
        ...(role && { role }),
      },
      select: { id: true, name: true, phone: true, email: true, role: true },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
