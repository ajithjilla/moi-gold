const { ZodError } = require("zod");

const format = (err) =>
  err.issues.map((i) => ({
    path: i.path.join("."),
    message: i.message,
    code: i.code,
  }));

const validate = (schema, source = "body") => (req, res, next) => {
  try {
    const parsed = schema.parse(req[source]);
    req[source] = parsed;
    next();
  } catch (e) {
    if (e instanceof ZodError) {
      return res.status(400).json({ error: "Validation failed", issues: format(e) });
    }
    next(e);
  }
};

module.exports = { validate };
