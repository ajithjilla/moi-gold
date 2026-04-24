const express = require("express");
const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
const env = require("../lib/env");
const { authenticate, requireRole } = require("../middleware/auth");
const asyncHandler = require("../lib/asyncHandler");
const { validate } = require("../lib/validate");
const {
  createAffiliateSchema,
  updateAffiliateSchema,
  settingsUpdateSchema,
} = require("../lib/schemas");
const { conflict, notFound } = require("../lib/errors");

const router = express.Router();
router.use(authenticate, requireRole("ADMIN"));

// ─── Dashboard ───────────────────────────────────────────────
router.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const [
      affiliateCount,
      activeAffiliates,
      eventCount,
      activeEvents,
      moiCount,
      moiSumAgg,
      revenueAgg,
      writersCount,
    ] = await Promise.all([
      prisma.affiliate.count(),
      prisma.affiliate.count({ where: { status: "ACTIVE" } }),
      prisma.event.count(),
      prisma.event.count({ where: { status: "ACTIVE" } }),
      prisma.moiEntry.count({ where: { voided: false } }),
      prisma.moiEntry.aggregate({
        _sum: { amount: true },
        where: { voided: false },
      }),
      prisma.affiliate.aggregate({ _sum: { revenue: true } }),
      prisma.eventWriter.count(),
    ]);
    res.json({
      affiliates: affiliateCount,
      activeAffiliates,
      events: eventCount,
      activeEvents,
      moiEntries: moiCount,
      totalMoi: moiSumAgg._sum.amount || 0,
      totalRevenue: revenueAgg._sum.revenue || 0,
      writers: writersCount,
    });
  })
);

router.get(
  "/revenue-series",
  asyncHandler(async (_req, res) => {
    const events = await prisma.event.findMany({
      select: { date: true, moi_entries: { select: { amount: true, voided: true } } },
      orderBy: { date: "asc" },
    });
    const byMonth = new Map();
    events.forEach((e) => {
      const k = new Date(e.date).toISOString().slice(0, 7);
      const sum = e.moi_entries.filter((m) => !m.voided).reduce((s, m) => s + m.amount, 0);
      byMonth.set(k, (byMonth.get(k) || 0) + sum);
    });
    res.json(Array.from(byMonth, ([month, amount]) => ({ month, amount })));
  })
);

// ─── Affiliates ───────────────────────────────────────────────
router.get(
  "/affiliates",
  asyncHandler(async (_req, res) => {
    const affiliates = await prisma.affiliate.findMany({
      include: {
        user: { select: { id: true, name: true, phone: true, email: true, active: true } },
        _count: { select: { events: true } },
      },
      orderBy: { join_date: "desc" },
    });
    res.json(affiliates);
  })
);

router.post(
  "/affiliates",
  validate(createAffiliateSchema),
  asyncHandler(async (req, res) => {
    const { name, phone, email, password, plan } = req.body;
    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) throw conflict("Phone already in use");
    const password_hash = await bcrypt.hash(password || phone, env.BCRYPT_ROUNDS);
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name, phone, email: email || null, password_hash, role: "AFFILIATE" },
      });
      const affiliate = await tx.affiliate.create({
        data: { user_id: user.id, plan: plan || "BASIC", status: "ACTIVE" },
      });
      return { affiliate, user };
    });
    res.status(201).json(result);
  })
);

router.patch(
  "/affiliates/:id",
  validate(updateAffiliateSchema),
  asyncHandler(async (req, res) => {
    const affiliate = await prisma.affiliate.update({
      where: { id: req.params.id },
      data: req.body,
      include: { user: { select: { id: true, name: true, phone: true, email: true, active: true } } },
    });
    res.json(affiliate);
  })
);

router.delete(
  "/affiliates/:id",
  asyncHandler(async (req, res) => {
    const affiliate = await prisma.affiliate.findUnique({ where: { id: req.params.id } });
    if (!affiliate) throw notFound("Affiliate not found");
    await prisma.$transaction([
      prisma.affiliate.delete({ where: { id: affiliate.id } }),
      prisma.user.delete({ where: { id: affiliate.user_id } }).catch(() => null),
    ]);
    res.json({ message: "Affiliate deleted" });
  })
);

// ─── Events (admin sees all) ─────────────────────────────────
router.get(
  "/events",
  asyncHandler(async (_req, res) => {
    const events = await prisma.event.findMany({
      include: {
        affiliate: { include: { user: { select: { name: true, phone: true } } } },
        _count: { select: { moi_entries: { where: { voided: false } }, writers: true } },
      },
      orderBy: { created_at: "desc" },
    });
    res.json(events);
  })
);

// ─── Settings ────────────────────────────────────────────────
router.get(
  "/settings",
  asyncHandler(async (_req, res) => {
    const rows = await prisma.setting.findMany();
    const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    res.json(settings);
  })
);

router.patch(
  "/settings",
  validate(settingsUpdateSchema),
  asyncHandler(async (req, res) => {
    const entries = Object.entries(req.body.settings);
    await prisma.$transaction(
      entries.map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
      )
    );
    const rows = await prisma.setting.findMany();
    res.json(Object.fromEntries(rows.map((r) => [r.key, r.value])));
  })
);

// ─── Audit log ──────────────────────────────────────────────
router.get(
  "/audit",
  asyncHandler(async (req, res) => {
    const take = Math.min(Number(req.query.limit) || 100, 500);
    const logs = await prisma.auditLog.findMany({
      orderBy: { created_at: "desc" },
      take,
      include: { actor: { select: { id: true, name: true, role: true } } },
    });
    res.json(logs);
  })
);

module.exports = router;
