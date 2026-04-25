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

// ─── WhatsApp thank-you message ─────────────────────────────
const buildDefaultMessage = (giver, amount, event) =>
  `Vanakkam ${giver},\n\nThank you for your generous gift of ₹${Number(amount).toLocaleString("en-IN")} at "${event}".\nYour support means a lot to us!\n\n— Moi Tech`;

const buildMessage = (template, giver, amount, event) => {
  if (!template) return buildDefaultMessage(giver, amount, event);
  return template
    .replace(/\{giver\}/g, giver)
    .replace(/\{amount\}/g, `₹${Number(amount).toLocaleString("en-IN")}`)
    .replace(/\{event\}/g, event);
};

const normalizePhone = (phone) => {
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.length < 7) return null;
  return digits.startsWith("91") ? digits : `91${digits}`;
};

router.post(
  "/:entryId/whatsapp",
  asyncHandler(async (req, res) => {
    const { access } = await getEventAccess(req.params.eventId, req.user);
    if (!access) throw forbidden("Access denied");

    const entry = await prisma.moiEntry.findFirst({
      where: { id: req.params.entryId, event_id: req.params.eventId },
    });
    if (!entry) throw notFound("Entry not found");
    if (!entry.phone) {
      return res.status(400).json({ error: "This entry has no phone number" });
    }

    const event = await prisma.event.findUnique({ where: { id: req.params.eventId } });
    if (!event) throw notFound("Event not found");

    const settingsRows = await prisma.setting.findMany({
      where: {
        key: {
          in: [
            "whatsapp_access_token",
            "whatsapp_phone_number_id",
            "whatsapp_msg_template",
          ],
        },
      },
    });
    const cfg = Object.fromEntries(settingsRows.map((r) => [r.key, r.value]));

    if (!cfg.whatsapp_access_token || !cfg.whatsapp_phone_number_id) {
      return res.status(400).json({
        error: "WhatsApp Business API is not configured. Ask your admin to set it up in Settings.",
      });
    }

    const to = normalizePhone(entry.phone);
    if (!to) {
      return res.status(400).json({ error: "Invalid phone number on this entry" });
    }

    const text = buildMessage(
      cfg.whatsapp_msg_template,
      entry.giver_name,
      entry.amount,
      event.name
    );

    const waRes = await fetch(
      `https://graph.facebook.com/v21.0/${cfg.whatsapp_phone_number_id}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cfg.whatsapp_access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: text },
        }),
      }
    );

    const waData = await waRes.json().catch(() => ({}));

    if (!waRes.ok) {
      const msg =
        waData?.error?.message || `WhatsApp API returned ${waRes.status}`;
      return res.status(502).json({ error: msg, wa_status: waRes.status });
    }

    res.json({
      message: `WhatsApp message sent to ${entry.giver_name}`,
      wa_message_id: waData?.messages?.[0]?.id || null,
    });
  })
);

module.exports = router;
