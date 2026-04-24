const { z } = require("zod");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  FRONTEND_URL: z.string().default("http://localhost:5173"),
  BCRYPT_ROUNDS: z.coerce.number().int().min(8).max(15).default(10),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  LOGIN_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  TRUST_PROXY: z.coerce.number().int().min(0).default(1),
});

function validate() {
  const isProd = process.env.NODE_ENV === "production";
  const result = envSchema.safeParse(process.env);

  if (result.success) return result.data;

  const issues = result.error.issues.map((i) => `  • ${i.path.join(".")}: ${i.message}`).join("\n");

  if (isProd) {
    console.error("\n❌ Invalid environment configuration:\n" + issues + "\n");
    process.exit(1);
  }

  // Dev/test fallbacks for optional-but-strict keys
  const patched = { ...process.env };
  if (!patched.DATABASE_URL) {
    patched.DATABASE_URL = "postgresql://postgres:password@localhost:5432/moi_gold";
  }
  if (!patched.JWT_SECRET || patched.JWT_SECRET.length < 32) {
    patched.JWT_SECRET = "dev-only-insecure-secret-change-for-production-xxxxxxxxxx";
  }
  const retry = envSchema.safeParse(patched);
  if (!retry.success) {
    const retryIssues = retry.error.issues
      .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    console.error("\n❌ Invalid environment configuration (dev):\n" + retryIssues + "\n");
    process.exit(1);
  }
  console.warn("\n⚠️  Environment warnings (dev mode, using fallbacks):\n" + issues + "\n");
  // Propagate the patched values to process.env too so downstream libs pick them up.
  Object.assign(process.env, patched);
  return retry.data;
}

module.exports = validate();
