const { z } = require("zod");

// Coerce empty strings / whitespace-only / null to undefined so `.optional()` works
// as users expect for HTML form inputs (which submit "" for blank fields).
const blankToUndef = (v) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const phone = z
  .string()
  .trim()
  .regex(/^\+?\d{7,15}$/i, "Phone must be 7–15 digits (optional leading +)");

const email = z.preprocess(
  blankToUndef,
  z.string().trim().email("Invalid email address").optional().nullable()
);

const password = z.string().min(6, "Password must be at least 6 characters").max(128);
const optionalPassword = z.preprocess(blankToUndef, password.optional());

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
    phone: z.preprocess(blankToUndef, phone.optional()),
    email: z.preprocess(blankToUndef, z.string().trim().email().optional()),
    password: z.string().min(1, "Password is required"),
  })
  .refine((d) => d.phone || d.email, {
    message: "Phone or email is required",
    path: ["phone"],
  });

const changePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password: password,
});

const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  email: email,
  phone: z.preprocess(blankToUndef, phone.optional()),
});

const createUserSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone,
  email,
  password: optionalPassword,
});

const updateUserSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  phone: z.preprocess(blankToUndef, phone.optional()),
  email: email,
  role: z.enum(["ADMIN", "AFFILIATE", "USER"]).optional(),
  active: z.boolean().optional(),
});

const createAffiliateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone,
  email,
  password: optionalPassword,
  plan: z.enum(PLANS).default("BASIC"),
});

const updateAffiliateSchema = z.object({
  plan: z.enum(PLANS).optional(),
  status: z.enum(AFFILIATE_STATUSES).optional(),
  revenue: z.number().min(0).optional(),
  notes: z.preprocess(blankToUndef, z.string().max(2000).nullable().optional()),
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
  owner_phone: z.preprocess(blankToUndef, phone.optional()),
  owner_email: email,
  status: z.enum(EVENT_STATUSES).optional(),
});

const toggleWriterAccessSchema = z.object({ enabled: z.boolean() });

const toggleShareSchema = z.object({ enabled: z.boolean() });

const assignWriterSchema = z.object({
  phone,
  name: z.preprocess(blankToUndef, z.string().trim().min(1).max(120).optional()),
});

const updateWriterSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  phone: z.preprocess(blankToUndef, phone.optional()),
});

// If denoms object is provided, the sum of (denomination × count) MUST equal amount.
// This guards against data entry errors where the cash breakdown doesn't add up.
const denomsMatchAmount = (data, ctx) => {
  if (!data || data.denoms == null || data.amount == null) return;
  const entries = Object.entries(data.denoms);
  if (entries.length === 0) return;
  const total = entries.reduce((sum, [denom, count]) => {
    const d = Number(denom);
    const c = Number(count);
    if (!Number.isFinite(d) || !Number.isFinite(c) || c < 0) return sum;
    return sum + d * c;
  }, 0);
  if (total !== Number(data.amount)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["denoms"],
      message: `Denomination total (₹${total}) does not match the amount (₹${data.amount})`,
    });
  }
};

const moiEntrySchema = z
  .object({
    giver_name: z.string().trim().min(1, "Giver name is required").max(200),
    amount: z.coerce.number().positive("Amount must be greater than 0").max(1e9),
    phone: z.preprocess(blankToUndef, z.string().trim().max(20).optional().nullable()),
    address: z.preprocess(blankToUndef, z.string().trim().max(300).optional().nullable()),
    relation: z.preprocess(blankToUndef, z.string().trim().max(60).optional().nullable()),
    method: z.enum(PAYMENT_METHODS).default("CASH"),
    note: z.preprocess(blankToUndef, z.string().trim().max(500).optional().nullable()),
    denoms: denomsSchema,
  })
  .superRefine(denomsMatchAmount);

const updateMoiEntrySchema = z
  .object({
    giver_name: z.string().trim().min(1).max(200).optional(),
    amount: z.coerce.number().positive().max(1e9).optional(),
    phone: z.preprocess(blankToUndef, z.string().trim().max(20).optional().nullable()),
    address: z.preprocess(blankToUndef, z.string().trim().max(300).optional().nullable()),
    relation: z.preprocess(blankToUndef, z.string().trim().max(60).optional().nullable()),
    method: z.enum(PAYMENT_METHODS).optional(),
    note: z.preprocess(blankToUndef, z.string().trim().max(500).optional().nullable()),
    denoms: denomsSchema,
  })
  .superRefine(denomsMatchAmount);

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
