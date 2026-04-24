const { z } = require("zod");

const phone = z
  .string()
  .trim()
  .regex(/^\+?\d{7,15}$/i, "Phone must be 7–15 digits (optional leading +)");

const email = z.string().trim().email().optional().nullable();

const password = z.string().min(6, "Password must be at least 6 characters").max(128);

const uuid = z.string().min(1);

const EVENT_TYPES = ["WEDDING", "ENGAGEMENT", "EAR", "CRADLE", "HOUSEWARMING", "BIRTHDAY", "OTHER"];
const EVENT_STATUSES = ["UPCOMING", "ACTIVE", "COMPLETED", "CANCELLED"];
const PAYMENT_METHODS = ["CASH", "GPAY", "PHONEPE", "PAYTM", "NEFT", "CHEQUE", "OTHER"];
const PLANS = ["BASIC", "PRO", "ENTERPRISE"];
const AFFILIATE_STATUSES = ["ACTIVE", "PENDING", "EXPIRED", "SUSPENDED"];

const denomsSchema = z
  .record(z.string(), z.number().int().min(0))
  .nullable()
  .optional();

const loginSchema = z
  .object({
    phone: phone.optional(),
    email: z.string().trim().email().optional(),
    password: z.string().min(1),
  })
  .refine((d) => d.phone || d.email, { message: "phone or email is required" });

const changePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password: password,
});

const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  email: email,
  phone: phone.optional(),
});

const createUserSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone,
  email,
  password: password.optional(),
});

const updateUserSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  phone: phone.optional(),
  email: email,
  role: z.enum(["ADMIN", "AFFILIATE", "USER"]).optional(),
  active: z.boolean().optional(),
});

const createAffiliateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone,
  email,
  password: password.optional(),
  plan: z.enum(PLANS).default("BASIC"),
});

const updateAffiliateSchema = z.object({
  plan: z.enum(PLANS).optional(),
  status: z.enum(AFFILIATE_STATUSES).optional(),
  revenue: z.number().min(0).optional(),
  notes: z.string().max(2000).nullable().optional(),
});

const createEventSchema = z.object({
  name: z.string().trim().min(1).max(200),
  type: z.enum(EVENT_TYPES),
  date: z.coerce.date(),
  venue: z.string().trim().min(1).max(200),
  owner_name: z.string().trim().min(1).max(120),
  owner_phone: phone,
  owner_email: email,
});

const updateEventSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  type: z.enum(EVENT_TYPES).optional(),
  date: z.coerce.date().optional(),
  venue: z.string().trim().min(1).max(200).optional(),
  owner_name: z.string().trim().min(1).max(120).optional(),
  owner_phone: phone.optional(),
  owner_email: email,
  status: z.enum(EVENT_STATUSES).optional(),
});

const toggleWriterAccessSchema = z.object({ enabled: z.boolean() });

const toggleShareSchema = z.object({ enabled: z.boolean() });

const assignWriterSchema = z.object({
  phone,
  name: z.string().trim().min(1).max(120).optional(),
});

const updateWriterSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  phone: phone.optional(),
});

const moiEntrySchema = z.object({
  giver_name: z.string().trim().min(1).max(200),
  amount: z.coerce.number().positive().max(1e9),
  phone: z.string().trim().max(20).optional().nullable(),
  address: z.string().trim().max(300).optional().nullable(),
  relation: z.string().trim().max(60).optional().nullable(),
  method: z.enum(PAYMENT_METHODS).default("CASH"),
  note: z.string().trim().max(500).optional().nullable(),
  denoms: denomsSchema,
});

const updateMoiEntrySchema = moiEntrySchema.partial();

const settingsUpdateSchema = z.object({
  settings: z.record(z.string().min(1).max(80), z.string().max(4000)),
});

module.exports = {
  loginSchema,
  changePasswordSchema,
  updateProfileSchema,
  createUserSchema,
  updateUserSchema,
  createAffiliateSchema,
  updateAffiliateSchema,
  createEventSchema,
  updateEventSchema,
  toggleWriterAccessSchema,
  toggleShareSchema,
  assignWriterSchema,
  updateWriterSchema,
  moiEntrySchema,
  updateMoiEntrySchema,
  settingsUpdateSchema,
  uuid,
};
