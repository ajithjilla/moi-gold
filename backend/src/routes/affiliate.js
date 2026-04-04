const express = require("express");
const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate, requireRole("AFFILIATE"));

// Helper: verify the affiliate owns the event
const ownsEvent = async (affiliateId, eventId) => {
  const event = await prisma.event.findFirst({
    where: { id: eventId, affiliate_id: affiliateId },
  });
  return event;
};

// ─── EVENTS ───────────────────────────────────────────────────────────────────

// GET /api/affiliate/events
router.get("/events", async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { affiliate_id: req.user.affiliate.id },
      include: {
        writers: {
          include: { user: { select: { id: true, name: true, phone: true } } },
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

// POST /api/affiliate/events
router.post("/events", async (req, res) => {
  const { name, type, date, venue, owner_name, owner_phone, owner_email } = req.body;
  if (!name || !type || !date || !venue || !owner_name || !owner_phone) {
    return res.status(400).json({ error: "name, type, date, venue, owner_name, owner_phone are required" });
  }
  try {
    const event = await prisma.event.create({
      data: {
        name,
        type,
        date: new Date(date),
        venue,
        owner_name,
        owner_phone,
        owner_email: owner_email || null,
        affiliate_id: req.user.affiliate.id,
      },
      include: { _count: { select: { moi_entries: true } } },
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/affiliate/events/:id
router.patch("/events/:id", async (req, res) => {
  const event = await ownsEvent(req.user.affiliate.id, req.params.id);
  if (!event) return res.status(403).json({ error: "Event not found or access denied" });
  const { name, type, date, venue, owner_name, owner_phone, owner_email, status } = req.body;
  try {
    const updated = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(date && { date: new Date(date) }),
        ...(venue && { venue }),
        ...(owner_name && { owner_name }),
        ...(owner_phone && { owner_phone }),
        ...(owner_email !== undefined && { owner_email: owner_email || null }),
        ...(status && { status }),
      },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/affiliate/events/:id/writer-access
router.patch("/events/:id/writer-access", async (req, res) => {
  const event = await ownsEvent(req.user.affiliate.id, req.params.id);
  if (!event) return res.status(403).json({ error: "Event not found or access denied" });
  const { enabled } = req.body;
  if (typeof enabled !== "boolean") return res.status(400).json({ error: "enabled (boolean) is required" });
  try {
    const updated = await prisma.event.update({
      where: { id: req.params.id },
      data: { writer_access_enabled: enabled },
    });
    res.json({ writer_access_enabled: updated.writer_access_enabled });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── WRITERS ──────────────────────────────────────────────────────────────────

// GET /api/affiliate/events/:id/writers
router.get("/events/:id/writers", async (req, res) => {
  const event = await ownsEvent(req.user.affiliate.id, req.params.id);
  if (!event) return res.status(403).json({ error: "Event not found or access denied" });
  try {
    const writers = await prisma.eventWriter.findMany({
      where: { event_id: req.params.id },
      include: { user: { select: { id: true, name: true, phone: true, email: true } } },
      orderBy: { assigned_at: "asc" },
    });
    res.json(writers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/affiliate/events/:id/writers
// Body: { phone, name? }  — looks up user by phone, creates if not found, then assigns
router.post("/events/:id/writers", async (req, res) => {
  const event = await ownsEvent(req.user.affiliate.id, req.params.id);
  if (!event) return res.status(403).json({ error: "Event not found or access denied" });
  const { phone, name } = req.body;
  if (!phone) return res.status(400).json({ error: "phone is required" });
  try {
    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      if (!name) return res.status(404).json({ error: "User not found. Provide name to create.", found: false });
      const password_hash = await bcrypt.hash(phone, 10);
      user = await prisma.user.create({
        data: { name, phone, password_hash, role: "USER" },
      });
    }
    // Check already assigned
    const existing = await prisma.eventWriter.findUnique({
      where: { event_id_user_id: { event_id: req.params.id, user_id: user.id } },
    });
    if (existing) return res.status(409).json({ error: "User already assigned as writer" });

    const writer = await prisma.eventWriter.create({
      data: {
        event_id: req.params.id,
        user_id: user.id,
        assigned_by: req.user.id,
      },
      include: { user: { select: { id: true, name: true, phone: true } } },
    });
    res.status(201).json(writer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/affiliate/events/:id/writers/:writerId  — edit writer's name/phone
router.patch("/events/:id/writers/:writerId", async (req, res) => {
  const event = await ownsEvent(req.user.affiliate.id, req.params.id);
  if (!event) return res.status(403).json({ error: "Event not found or access denied" });
  try {
    const ew = await prisma.eventWriter.findFirst({
      where: { id: req.params.writerId, event_id: req.params.id },
    });
    if (!ew) return res.status(404).json({ error: "Writer assignment not found" });
    const { name, phone } = req.body;
    const updated = await prisma.user.update({
      where: { id: ew.user_id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
      },
      select: { id: true, name: true, phone: true },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/affiliate/events/:id/writers/:writerId
router.delete("/events/:id/writers/:writerId", async (req, res) => {
  const event = await ownsEvent(req.user.affiliate.id, req.params.id);
  if (!event) return res.status(403).json({ error: "Event not found or access denied" });
  try {
    const ew = await prisma.eventWriter.findFirst({
      where: { id: req.params.writerId, event_id: req.params.id },
    });
    if (!ew) return res.status(404).json({ error: "Writer assignment not found" });
    await prisma.eventWriter.delete({ where: { id: req.params.writerId } });
    res.json({ message: "Writer removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
