const express = require("express");
const prisma = require("../lib/prisma");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate, requireRole("USER"));

// GET /api/writer/events  — events this user is assigned to as a writer
router.get("/events", async (req, res) => {
  try {
    const assignments = await prisma.eventWriter.findMany({
      where: { user_id: req.user.id },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            type: true,
            date: true,
            venue: true,
            status: true,
            writer_access_enabled: true,
          },
        },
      },
      orderBy: { assigned_at: "desc" },
    });
    res.json(assignments.map((a) => a.event));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/writer/events/:eventId  — limited event detail (no financials)
router.get("/events/:eventId", async (req, res) => {
  try {
    const assignment = await prisma.eventWriter.findFirst({
      where: { user_id: req.user.id, event_id: req.params.eventId },
    });
    if (!assignment) return res.status(403).json({ error: "Not assigned to this event" });

    const event = await prisma.event.findUnique({
      where: { id: req.params.eventId },
      select: {
        id: true,
        name: true,
        type: true,
        date: true,
        venue: true,
        status: true,
        writer_access_enabled: true,
      },
    });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
