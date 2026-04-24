const express = require("express");
const rateLimit = require("express-rate-limit");
const prisma = require("../lib/prisma");
const asyncHandler = require("../lib/asyncHandler");
const { notFound, forbidden } = require("../lib/errors");

const router = express.Router();

const publicLimiter = rateLimit({
  windowMs: 60_000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests" },
});
router.use(publicLimiter);

const PLANS = [
  {
    id: "BASIC",
    name: "Basic",
    price: 299,
    currency: "INR",
    period: "month",
    features: ["Up to 5 events/month", "50 Moi entries/event", "PDF Export", "Email support"],
  },
  {
    id: "PRO",
    name: "Pro",
    price: 599,
    currency: "INR",
    period: "month",
    featured: true,
    features: [
      "Unlimited events",
      "Unlimited Moi entries",
      "PDF + CSV Export",
      "WhatsApp share link",
      "Priority support",
      "Tamil language UI",
    ],
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: 1299,
    currency: "INR",
    period: "month",
    features: [
      "Everything in Pro",
      "Multiple operators",
      "Custom branding",
      "Dedicated support",
      "API access",
      "Analytics dashboard",
    ],
  },
];

router.get("/plans", (_req, res) => res.json(PLANS));

// Public settings (only white-listed keys are returned)
const PUBLIC_SETTING_KEYS = [
  "app_name",
  "brand_title",
  "brand_subtitle",
  "footer_note",
  "welcome_message_ta",
  "support_email",
];

router.get(
  "/settings",
  asyncHandler(async (_req, res) => {
    const rows = await prisma.setting.findMany({ where: { key: { in: PUBLIC_SETTING_KEYS } } });
    res.json(Object.fromEntries(rows.map((r) => [r.key, r.value])));
  })
);

// ─── Event owner public share view ──────────────────────────────────
router.get(
  "/events/shared/:token",
  asyncHandler(async (req, res) => {
    const event = await prisma.event.findUnique({
      where: { share_token: req.params.token },
      include: { affiliate: { include: { user: { select: { name: true } } } } },
    });
    if (!event) throw notFound("Link is invalid");
    if (!event.share_enabled) throw forbidden("Owner sharing is disabled for this event");

    const entries = await prisma.moiEntry.findMany({
      where: { event_id: event.id, voided: false },
      select: {
        id: true, giver_name: true, amount: true, phone: true, relation: true,
        method: true, note: true, created_at: true,
      },
      orderBy: { created_at: "desc" },
    });
    const total = entries.reduce((s, e) => s + e.amount, 0);
    res.json({
      event: {
        id: event.id,
        name: event.name,
        type: event.type,
        date: event.date,
        venue: event.venue,
        owner_name: event.owner_name,
        status: event.status,
        affiliate_name: event.affiliate?.user?.name || null,
      },
      summary: { total, count: entries.length },
      entries,
    });
  })
);

module.exports = router;
