const express = require("express");
const prisma = require("../lib/prisma");
const { authenticate } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });
router.use(authenticate);

// Helper: verify access to event
// - ADMIN / AFFILIATE (owner) gets full access
// - USER gets access only if assigned as writer
const getEventAccess = async (eventId, user) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      affiliate: true,
      writers: { where: { user_id: user.id } },
    },
  });
  if (!event) return { event: null, access: null };

  if (user.role === "ADMIN") return { event, access: "full" };
  if (user.role === "AFFILIATE" && event.affiliate_id === user.affiliate?.id)
    return { event, access: "full" };
  if (user.role === "USER" && event.writers.length > 0)
    return { event, access: "writer" };

  return { event: null, access: null };
};

// GET /api/events/:eventId/moi
router.get("/", async (req, res) => {
  const { event, access } = await getEventAccess(req.params.eventId, req.user);
  if (!access) return res.status(403).json({ error: "Access denied" });

  try {
    const where = { event_id: req.params.eventId };
    // Writers see only their own entries
    if (access === "writer") where.written_by_id = req.user.id;

    const entries = await prisma.moiEntry.findMany({
      where,
      include: {
        written_by: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { created_at: "desc" },
    });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events/:eventId/moi
router.post("/", async (req, res) => {
  const { event, access } = await getEventAccess(req.params.eventId, req.user);
  if (!access) return res.status(403).json({ error: "Access denied" });

  // Writers can only add entries when writer_access_enabled
  if (access === "writer" && !event.writer_access_enabled) {
    return res.status(403).json({ error: "Writer access is currently disabled for this event" });
  }

  const { giver_name, amount, phone, address, relation, method, note, denoms } = req.body;
  if (!giver_name || amount === undefined) {
    return res.status(400).json({ error: "giver_name and amount are required" });
  }
  try {
    const entry = await prisma.moiEntry.create({
      data: {
        event_id: req.params.eventId,
        giver_name,
        amount: Number(amount),
        phone: phone || null,
        address: address || null,
        relation: relation || null,
        method: method || "CASH",
        note: note || null,
        denoms: denoms || null,
        written_by_id: req.user.id,
      },
      include: {
        written_by: { select: { id: true, name: true, phone: true } },
      },
    });
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/events/:eventId/moi/:entryId
router.patch("/:entryId", async (req, res) => {
  const { event, access } = await getEventAccess(req.params.eventId, req.user);
  if (!access) return res.status(403).json({ error: "Access denied" });

  try {
    const entry = await prisma.moiEntry.findFirst({
      where: { id: req.params.entryId, event_id: req.params.eventId },
    });
    if (!entry) return res.status(404).json({ error: "Entry not found" });

    // Writer can only edit their own entries and only when access is enabled
    if (access === "writer") {
      if (entry.written_by_id !== req.user.id) return res.status(403).json({ error: "Can only edit your own entries" });
      if (!event.writer_access_enabled) return res.status(403).json({ error: "Writer access is currently disabled" });
    }

    const { giver_name, amount, phone, address, relation, method, note, denoms } = req.body;
    const updated = await prisma.moiEntry.update({
      where: { id: req.params.entryId },
      data: {
        ...(giver_name && { giver_name }),
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(address !== undefined && { address: address || null }),
        ...(relation !== undefined && { relation: relation || null }),
        ...(method && { method }),
        ...(note !== undefined && { note: note || null }),
        ...(denoms !== undefined && { denoms }),
      },
      include: { written_by: { select: { id: true, name: true, phone: true } } },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/events/:eventId/moi/:entryId/void  — Affiliate only
router.patch("/:entryId/void", async (req, res) => {
  const { access } = await getEventAccess(req.params.eventId, req.user);
  if (access !== "full") return res.status(403).json({ error: "Only event affiliates can void entries" });

  try {
    const entry = await prisma.moiEntry.findFirst({
      where: { id: req.params.entryId, event_id: req.params.eventId },
    });
    if (!entry) return res.status(404).json({ error: "Entry not found" });

    const updated = await prisma.moiEntry.update({
      where: { id: req.params.entryId },
      data: { voided: true },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
