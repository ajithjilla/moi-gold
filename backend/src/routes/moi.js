const express = require("express");
const prisma = require("../lib/prisma");
const { authenticate } = require("../middleware/auth");
const asyncHandler = require("../lib/asyncHandler");
const { validate } = require("../lib/validate");
const { moiEntrySchema, updateMoiEntrySchema } = require("../lib/schemas");
const { forbidden, notFound } = require("../lib/errors");

const router = express.Router({ mergeParams: true });
router.use(authenticate);

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

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { event, access } = await getEventAccess(req.params.eventId, req.user);
    if (!access) throw forbidden("Access denied");
    const where = { event_id: req.params.eventId };
    if (access === "writer") where.written_by_id = req.user.id;

    const entries = await prisma.moiEntry.findMany({
      where,
      include: { written_by: { select: { id: true, name: true, phone: true } } },
      orderBy: { created_at: "desc" },
    });
    res.json({ access, event_id: event.id, entries });
  })
);

router.post(
  "/",
  validate(moiEntrySchema),
  asyncHandler(async (req, res) => {
    const { event, access } = await getEventAccess(req.params.eventId, req.user);
    if (!access) throw forbidden("Access denied");
    if (access === "writer" && !event.writer_access_enabled) {
      throw forbidden("Writer access is currently disabled for this event");
    }
    const entry = await prisma.moiEntry.create({
      data: {
        ...req.body,
        phone: req.body.phone ?? null,
        address: req.body.address ?? null,
        relation: req.body.relation ?? null,
        note: req.body.note ?? null,
        denoms: req.body.denoms ?? null,
        event_id: req.params.eventId,
        written_by_id: req.user.id,
      },
      include: { written_by: { select: { id: true, name: true, phone: true } } },
    });
    res.status(201).json(entry);
  })
);

router.patch(
  "/:entryId",
  validate(updateMoiEntrySchema),
  asyncHandler(async (req, res) => {
    const { event, access } = await getEventAccess(req.params.eventId, req.user);
    if (!access) throw forbidden("Access denied");
    const entry = await prisma.moiEntry.findFirst({
      where: { id: req.params.entryId, event_id: req.params.eventId },
    });
    if (!entry) throw notFound("Entry not found");
    if (access === "writer") {
      if (entry.written_by_id !== req.user.id) throw forbidden("Can only edit your own entries");
      if (!event.writer_access_enabled) throw forbidden("Writer access is currently disabled");
    }
    if (entry.voided) throw forbidden("Voided entries cannot be edited");

    const updated = await prisma.moiEntry.update({
      where: { id: req.params.entryId },
      data: req.body,
      include: { written_by: { select: { id: true, name: true, phone: true } } },
    });
    res.json(updated);
  })
);

router.patch(
  "/:entryId/void",
  asyncHandler(async (req, res) => {
    const { access } = await getEventAccess(req.params.eventId, req.user);
    if (access !== "full") throw forbidden("Only event affiliates can void entries");
    const entry = await prisma.moiEntry.findFirst({
      where: { id: req.params.entryId, event_id: req.params.eventId },
    });
    if (!entry) throw notFound("Entry not found");
    const updated = await prisma.moiEntry.update({
      where: { id: req.params.entryId },
      data: { voided: true, voided_at: new Date(), voided_by_id: req.user.id },
    });
    res.json(updated);
  })
);

router.patch(
  "/:entryId/restore",
  asyncHandler(async (req, res) => {
    const { access } = await getEventAccess(req.params.eventId, req.user);
    if (access !== "full") throw forbidden("Only event affiliates can restore entries");
    const updated = await prisma.moiEntry.update({
      where: { id: req.params.entryId },
      data: { voided: false, voided_at: null, voided_by_id: null },
    });
    res.json(updated);
  })
);

router.delete(
  "/:entryId",
  asyncHandler(async (req, res) => {
    const { access } = await getEventAccess(req.params.eventId, req.user);
    if (access !== "full") throw forbidden("Only event affiliates can permanently delete");
    await prisma.moiEntry.delete({ where: { id: req.params.entryId } });
    res.json({ message: "Entry deleted" });
  })
);

module.exports = router;
