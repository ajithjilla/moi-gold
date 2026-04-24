const { ZodError } = require("zod");

const format = (err) =>
  err.issues.map((i) => ({
    path: i.path.join("."),
    message: i.message,
    code: i.code,
  }));

// Build a single, user-friendly error string like "Email: Invalid email, Password: too short"
// so toast.error() on the frontend reads naturally even without parsing `issues`.
const summarize = (issues) =>
  issues
    .map((i) => {
      const field = i.path ? i.path.split(".").pop() : "";
      const pretty = field
        ? field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, " ")
        : "";
      return pretty ? `${pretty}: ${i.message}` : i.message;
    })
    .join("; ");

const validate = (schema, source = "body") => (req, res, next) => {
  try {
    const parsed = schema.parse(req[source]);
    req[source] = parsed;
    next();
  } catch (e) {
    if (e instanceof ZodError) {
      const issues = format(e);
      return res.status(400).json({
        error: summarize(issues) || "Validation failed",
        issues,
      });
    }
    next(e);
  }
};

module.exports = { validate };
