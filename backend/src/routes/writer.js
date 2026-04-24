const express = require("express");
const prisma = require("../lib/prisma");
const { authenticate, requireRole } = require("../middleware/auth");
const asyncHandler = require("../lib/asyncHandler");
const { notFound } = require("../lib/errors");

const router = express.Router();
router.use(authenticate, requireRole("USER"));

router.get(
  "/events",
  asyncHandler(async (req, res) => {
    const assignments = await prisma.eventWriter.findMany({
      where: { user_id: req.user.id },
      include: {
        event: {
          select: {
            id: true, name: true, type: true, date: true, venue: true, status: true,
            writer_access_enabled: true,
          },
        },
      },
      orderBy: { assigned_at: "desc" },
    });
    res.json(assignments.map((a) => a.event));
  })
);

router.get(
  "/events/:eventId",
  asyncHandler(async (req, res) => {
    const assignment = await prisma.eventWriter.findFirst({
      where: { user_id: req.user.id, event_id: req.params.eventId },
    });
    if (!assignment) throw notFound("Not assigned to this event");
    const event = await prisma.event.findUnique({
      where: { id: req.params.eventId },
      select: {
        id: true, name: true, type: true, date: true, venue: true, status: true,
        writer_access_enabled: true,
      },
    });
    res.json(event);
  })
);

router.get(
  "/events/:eventId/stats",
  asyncHandler(async (req, res) => {
    const assignment = await prisma.eventWriter.findFirst({
      where: { user_id: req.user.id, event_id: req.params.eventId },
    });
    if (!assignment) throw notFound("Not assigned to this event");
    const myEntries = await prisma.moiEntry.findMany({
      where: {
        event_id: req.params.eventId,
        written_by_id: req.user.id,
        voided: false,
      },
      select: { amount: true },
    });
    const total = myEntries.reduce((s, e) => s + e.amount, 0);
    res.json({ myCount: myEntries.length, myTotal: total });
  })
);

module.exports = router;
