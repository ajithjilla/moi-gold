const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const safeUser = (user) => ({
  id: user.id,
  name: user.name,
  phone: user.phone,
  email: user.email,
  role: user.role,
  affiliate: user.affiliate || null,
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { phone, email, password } = req.body;
  if (!password || (!phone && !email)) {
    return res.status(400).json({ error: "Phone/email and password are required" });
  }
  try {
    const user = await prisma.user.findFirst({
      where: phone ? { phone } : { email },
      include: { affiliate: true },
    });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });
    const token = signToken(user.id);
    res.json({ token, user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get("/me", authenticate, (req, res) => {
  res.json({ user: safeUser(req.user) });
});

// POST /api/auth/logout  (client just drops the token; endpoint is a no-op)
router.post("/logout", authenticate, (_req, res) => {
  res.json({ message: "Logged out" });
});

module.exports = router;
