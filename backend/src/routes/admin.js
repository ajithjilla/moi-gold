const express = require("express");
const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate, requireRole("ADMIN"));

// GET /api/admin/stats
router.get("/stats", async (_req, res) => {
  try {
    const [affiliateCount, eventCount, moiCount, revenue] = await Promise.all([
      prisma.affiliate.count(),
      prisma.event.count(),
      prisma.moiEntry.count({ where: { voided: false } }),
      prisma.affiliate.aggregate({ _sum: { revenue: true } }),
    ]);
    res.json({
      affiliates: affiliateCount,
      events: eventCount,
      moiEntries: moiCount,
      totalRevenue: revenue._sum.revenue || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/affiliates
router.get("/affiliates", async (_req, res) => {
  try {
    const affiliates = await prisma.affiliate.findMany({
      include: {
        user: { select: { id: true, name: true, phone: true, email: true } },
        _count: { select: { events: true } },
      },
      orderBy: { join_date: "desc" },
    });
    res.json(affiliates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/affiliates  — creates User + Affiliate atomically
router.post("/affiliates", async (req, res) => {
  const { name, phone, email, password, plan } = req.body;
  if (!name || !phone) return res.status(400).json({ error: "name and phone are required" });
  try {
    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) return res.status(409).json({ error: "Phone already in use" });
    const password_hash = await bcrypt.hash(password || phone, 10);
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name, phone, email: email || null, password_hash, role: "AFFILIATE" },
      });
      const affiliate = await tx.affiliate.create({
        data: { user_id: user.id, plan: plan || "BASIC", status: "ACTIVE" },
      });
      return { user, affiliate };
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/affiliates/:id
router.patch("/affiliates/:id", async (req, res) => {
  const { plan, status, revenue } = req.body;
  try {
    const affiliate = await prisma.affiliate.update({
      where: { id: req.params.id },
      data: {
        ...(plan && { plan }),
        ...(status && { status }),
        ...(revenue !== undefined && { revenue }),
      },
      include: { user: { select: { id: true, name: true, phone: true, email: true } } },
    });
    res.json(affiliate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/events
router.get("/events", async (_req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        affiliate: {
          include: { user: { select: { name: true, phone: true } } },
        },
        _count: { select: { moi_entries: { where: { voided: false } } } },
      },
      orderBy: { created_at: "desc" },
    });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
