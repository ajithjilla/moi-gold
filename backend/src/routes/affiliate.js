const express = require("express");
const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
const env = require("../lib/env");
const { authenticate, requireRole } = require("../middleware/auth");
const asyncHandler = require("../lib/asyncHandler");
const { validate } = require("../lib/validate");
const {
  createEventSchema,
  updateEventSchema,
  toggleWriterAccessSchema,
  toggleShareSchema,
  assignWriterSchema,
  updateWriterSchema,
} = require("../lib/schemas");
const { forbidden, notFound, conflict, badRequest } = require("../lib/errors");

const router = express.Router();
router.use(authenticate, requireRole("AFFILIATE", "ADMIN"));

// Helper: scope events to affiliate unless admin
const scopeWhere = (req) =>
  req.user.role === "ADMIN" ? {} : { affiliate_id: req.user.affiliate?.id };

const ownsEvent = async (req, eventId) => {
  const where =
    req.user.role === "ADMIN"
      ? { id: eventId }
      : { id: eventId, affiliate_id: req.user.affiliate?.id };
  return prisma.event.findFirst({ where });
};

// ─── EVENTS ─────────────────────────────────────────────────
router.get(
  "/events",
  asyncHandler(async (req, res) => {
    if (req.user.role !== "ADMIN" && !req.user.affiliate) {
      throw forbidden("No affiliate profile associated with this user");
    }
    const events = await prisma.event.findMany({
      where: scopeWhere(req),
      include: {
        writers: {
          include: { user: { select: { id: true, name: true, phone: true } } },
        },
        _count: {
          select: { moi_entries: { where: { voided: false } }, writers: true },
        },
      },
      orderBy: { date: "desc" },
    });
    res.json(events);
  })
);

router.get(
  "/events/:id",
  asyncHandler(async (req, res) => {
    const event = await ownsEvent(req, req.params.id);
    if (!event) throw notFound("Event not found or access denied");
    const full = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        writers: { include: { user: { select: { id: true, name: true, phone: true } } } },
        _count: { select: { moi_entries: { where: { voided: false } } } },
      },
    });
    res.json(full);
  })
);

router.post(
  "/events",
  validate(createEventSchema),
  asyncHandler(async (req, res) => {
    if (req.user.role === "ADMIN" && !req.body.affiliate_id && !req.user.affiliate) {
      throw badRequest("Admin must supply affiliate_id for event creation");
    }
    const affiliate_id =
      req.user.role === "ADMIN" && req.body.affiliate_id
        ? req.body.affiliate_id
        : req.user.affiliate.id;
    const event = await prisma.event.create({
      data: { ...req.body, affiliate_id },
      include: { _count: { select: { moi_entries: true, writers: true } } },
    });
    res.status(201).json(event);
  })
);

router.patch(
  "/events/:id",
  validate(updateEventSchema),
  asyncHandler(async (req, res) => {
    const event = await ownsEvent(req, req.params.id);
    if (!event) throw notFound("Event not found or access denied");
    const updated = await prisma.event.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updated);
  })
);

router.delete(
  "/events/:id",
  asyncHandler(async (req, res) => {
    const event = await ownsEvent(req, req.params.id);
    if (!event) throw notFound("Event not found or access denied");
    await prisma.event.delete({ where: { id: req.params.id } });
    res.json({ message: "Event deleted" });
  })
);

// ─── Writer access & share ────────────────────────────────
router.patch(
  "/events/:id/writer-access",
  validate(toggleWriterAccessSchema),
  asyncHandler(async (req, res) => {
    const event = await ownsEvent(req, req.params.id);
    if (!event) throw notFound("Event not found or access denied");
    const updated = await prisma.event.update({
      where: { id: req.params.id },
      data: { writer_access_enabled: req.body.enabled },
    });
    res.json({ writer_access_enabled: updated.writer_access_enabled });
  })
);

router.patch(
  "/events/:id/share",
  validate(toggleShareSchema),
  asyncHandler(async (req, res) => {
    const event = await ownsEvent(req, req.params.id);
    if (!event) throw notFound("Event not found or access denied");
    const updated = await prisma.event.update({
      where: { id: req.params.id },
      data: { share_enabled: req.body.enabled },
    });
    res.json({
      share_enabled: updated.share_enabled,
      share_token: updated.share_token,
    });
  })
);

router.post(
  "/events/:id/regenerate-share",
  asyncHandler(async (req, res) => {
    const event = await ownsEvent(req, req.params.id);
    if (!event) throw notFound("Event not found or access denied");
    const { customAlphabet } = require("nanoid");
    const gen = customAlphabet("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 18);
    const share_token = gen();
    const updated = await prisma.event.update({
      where: { id: req.params.id },
      data: { share_token },
    });
    res.json({ share_token: updated.share_token });
  })
);

// ─── WRITERS ──────────────────────────────────────────────
router.get(
  "/events/:id/writers",
  asyncHandler(async (req, res) => {
    const event = await ownsEvent(req, req.params.id);
    if (!event) throw notFound("Event not found or access denied");
    const writers = await prisma.eventWriter.findMany({
      where: { event_id: req.params.id },
      include: { user: { select: { id: true, name: true, phone: true, email: true } } },
      orderBy: { assigned_at: "asc" },
    });
    res.json(writers);
  })
);

router.post(
  "/events/:id/writers",
  validate(assignWriterSchema),
  asyncHandler(async (req, res) => {
    const event = await ownsEvent(req, req.params.id);
    if (!event) throw notFound("Event not found or access denied");
    const { phone, name } = req.body;
    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      if (!name) throw notFound("User not found. Provide name to auto-create.");
      const password_hash = await bcrypt.hash(phone, env.BCRYPT_ROUNDS);
      user = await prisma.user.create({
        data: { name, phone, password_hash, role: "USER" },
      });
    }
    const existing = await prisma.eventWriter.findUnique({
      where: { event_id_user_id: { event_id: req.params.id, user_id: user.id } },
    });
    if (existing) throw conflict("User already assigned as writer");

    const writer = await prisma.eventWriter.create({
      data: { event_id: req.params.id, user_id: user.id, assigned_by: req.user.id },
      include: { user: { select: { id: true, name: true, phone: true } } },
    });
    res.status(201).json(writer);
  })
);

router.patch(
  "/events/:id/writers/:writerId",
  validate(updateWriterSchema),
  asyncHandler(async (req, res) => {
    const event = await ownsEvent(req, req.params.id);
    if (!event) throw notFound("Event not found or access denied");
    const ew = await prisma.eventWriter.findFirst({
      where: { id: req.params.writerId, event_id: req.params.id },
    });
    if (!ew) throw notFound("Writer assignment not found");
    const updated = await prisma.user.update({
      where: { id: ew.user_id },
      data: req.body,
      select: { id: true, name: true, phone: true },
    });
    res.json(updated);
  })
);

router.delete(
  "/events/:id/writers/:writerId",
  asyncHandler(async (req, res) => {
    const event = await ownsEvent(req, req.params.id);
    if (!event) throw notFound("Event not found or access denied");
    const ew = await prisma.eventWriter.findFirst({
      where: { id: req.params.writerId, event_id: req.params.id },
    });
    if (!ew) throw notFound("Writer assignment not found");
    await prisma.eventWriter.delete({ where: { id: req.params.writerId } });
    res.json({ message: "Writer removed" });
  })
);

module.exports = router;
