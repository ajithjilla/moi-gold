const express = require("express");
const prisma = require("../lib/prisma");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });
router.use(authenticate, requireRole("AFFILIATE", "ADMIN"));

const DENOMS = [500, 200, 100, 50, 20, 10, 5, 2, 1];

const getOwnedEvent = async (affiliateId, eventId, isAdmin) => {
  return prisma.event.findFirst({
    where: isAdmin ? { id: eventId } : { id: eventId, affiliate_id: affiliateId },
    include: { affiliate: { include: { user: { select: { name: true } } } } },
  });
};

// GET /api/events/:eventId/settlement
router.get("/settlement", async (req, res) => {
  const isAdmin = req.user.role === "ADMIN";
  const event = await getOwnedEvent(req.user.affiliate?.id, req.params.eventId, isAdmin);
  if (!event) return res.status(403).json({ error: "Event not found or access denied" });

  try {
    const entries = await prisma.moiEntry.findMany({
      where: { event_id: req.params.eventId, voided: false },
      select: { amount: true, method: true, denoms: true },
    });

    const cashEntries = entries.filter((e) => e.method === "CASH");
    const digitalEntries = entries.filter((e) => e.method !== "CASH");
    const cashTotal = cashEntries.reduce((s, e) => s + e.amount, 0);
    const digitalTotal = digitalEntries.reduce((s, e) => s + e.amount, 0);
    const grandTotal = cashTotal + digitalTotal;

    // Aggregate denominations across all cash entries
    const denomAgg = {};
    cashEntries.forEach((e) => {
      if (e.denoms && typeof e.denoms === "object") {
        DENOMS.forEach((d) => {
          const qty = e.denoms[String(d)] || e.denoms[d] || 0;
          if (qty > 0) denomAgg[d] = (denomAgg[d] || 0) + qty;
        });
      }
    });

    // Method breakdown for digital
    const methodMap = {};
    digitalEntries.forEach((e) => {
      if (!methodMap[e.method]) methodMap[e.method] = { count: 0, total: 0 };
      methodMap[e.method].count++;
      methodMap[e.method].total += e.amount;
    });

    res.json({
      event: { id: event.id, name: event.name, date: event.date },
      grandTotal,
      cashTotal,
      digitalTotal,
      cashCount: cashEntries.length,
      digitalCount: digitalEntries.length,
      totalEntries: entries.length,
      denomBreakdown: denomAgg,
      methodBreakdown: methodMap,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events/:eventId/report  — full data for PDF generation
router.get("/report", async (req, res) => {
  const isAdmin = req.user.role === "ADMIN";
  const event = await getOwnedEvent(req.user.affiliate?.id, req.params.eventId, isAdmin);
  if (!event) return res.status(403).json({ error: "Event not found or access denied" });

  try {
    const entries = await prisma.moiEntry.findMany({
      where: { event_id: req.params.eventId },
      include: { written_by: { select: { id: true, name: true, phone: true } } },
      orderBy: { created_at: "asc" },
    });

    const activeEntries = entries.filter((e) => !e.voided);
    const totalAmount = activeEntries.reduce((s, e) => s + e.amount, 0);

    res.json({
      event,
      entries,
      summary: {
        totalEntries: activeEntries.length,
        voidedEntries: entries.filter((e) => e.voided).length,
        totalAmount,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
