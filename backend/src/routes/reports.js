const express = require("express");
const prisma = require("../lib/prisma");
const { authenticate, requireRole } = require("../middleware/auth");
const asyncHandler = require("../lib/asyncHandler");
const { forbidden, notFound } = require("../lib/errors");

const router = express.Router({ mergeParams: true });
router.use(authenticate, requireRole("AFFILIATE", "ADMIN"));

const DENOMS = [500, 200, 100, 50, 20, 10, 5, 2, 1];

const getOwnedEvent = async (req) => {
  const where =
    req.user.role === "ADMIN"
      ? { id: req.params.eventId }
      : { id: req.params.eventId, affiliate_id: req.user.affiliate?.id };
  return prisma.event.findFirst({
    where,
    include: { affiliate: { include: { user: { select: { name: true, phone: true } } } } },
  });
};

router.get(
  "/settlement",
  asyncHandler(async (req, res) => {
    const event = await getOwnedEvent(req);
    if (!event) throw forbidden("Event not found or access denied");

    const entries = await prisma.moiEntry.findMany({
      where: { event_id: req.params.eventId, voided: false },
      select: { amount: true, method: true, denoms: true },
    });

    const cashEntries = entries.filter((e) => e.method === "CASH");
    const digitalEntries = entries.filter((e) => e.method !== "CASH");
    const cashTotal = cashEntries.reduce((s, e) => s + e.amount, 0);
    const digitalTotal = digitalEntries.reduce((s, e) => s + e.amount, 0);
    const grandTotal = cashTotal + digitalTotal;

    const denomAgg = {};
    cashEntries.forEach((e) => {
      if (e.denoms && typeof e.denoms === "object") {
        DENOMS.forEach((d) => {
          const qty = e.denoms[String(d)] || e.denoms[d] || 0;
          if (qty > 0) denomAgg[d] = (denomAgg[d] || 0) + qty;
        });
      }
    });

    const methodMap = {};
    digitalEntries.forEach((e) => {
      if (!methodMap[e.method]) methodMap[e.method] = { count: 0, total: 0 };
      methodMap[e.method].count++;
      methodMap[e.method].total += e.amount;
    });

    res.json({
      event: { id: event.id, name: event.name, date: event.date, venue: event.venue },
      grandTotal,
      cashTotal,
      digitalTotal,
      cashCount: cashEntries.length,
      digitalCount: digitalEntries.length,
      totalEntries: entries.length,
      denomBreakdown: denomAgg,
      methodBreakdown: methodMap,
    });
  })
);

router.get(
  "/report",
  asyncHandler(async (req, res) => {
    const event = await getOwnedEvent(req);
    if (!event) throw forbidden("Event not found or access denied");

    const entries = await prisma.moiEntry.findMany({
      where: { event_id: req.params.eventId },
      include: { written_by: { select: { id: true, name: true, phone: true } } },
      orderBy: { created_at: "asc" },
    });

    const active = entries.filter((e) => !e.voided);
    const totalAmount = active.reduce((s, e) => s + e.amount, 0);

    res.json({
      event,
      entries,
      summary: {
        totalEntries: active.length,
        voidedEntries: entries.length - active.length,
        totalAmount,
        generatedAt: new Date().toISOString(),
      },
    });
  })
);

router.get(
  "/export.csv",
  asyncHandler(async (req, res) => {
    const event = await getOwnedEvent(req);
    if (!event) throw forbidden("Event not found or access denied");
    const entries = await prisma.moiEntry.findMany({
      where: { event_id: req.params.eventId, voided: false },
      include: { written_by: { select: { name: true, phone: true } } },
      orderBy: { created_at: "asc" },
    });
    const esc = (v) => {
      if (v === null || v === undefined) return "";
      const s = String(v).replace(/"/g, '""');
      return /[",\n]/.test(s) ? `"${s}"` : s;
    };
    const rows = [
      ["#", "Giver", "Amount", "Phone", "Address", "Relation", "Method", "Note", "Written By", "Created"],
      ...entries.map((e, i) => [
        i + 1,
        e.giver_name,
        e.amount,
        e.phone || "",
        e.address || "",
        e.relation || "",
        e.method,
        e.note || "",
        e.written_by?.name || "",
        e.created_at.toISOString(),
      ]),
    ];
    const csv = rows.map((r) => r.map(esc).join(",")).join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="moi-${event.name.replace(/[^a-z0-9]+/gi, "-")}.csv"`
    );
    res.send(csv);
  })
);

module.exports = router;
