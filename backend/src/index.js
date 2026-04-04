require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");
const affiliateRoutes = require("./routes/affiliate");
const moiRoutes = require("./routes/moi");
const reportsRoutes = require("./routes/reports");
const writerRoutes = require("./routes/writer");

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "*", credentials: true }));
app.use(express.json());

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/affiliate", affiliateRoutes);
app.use("/api/events/:eventId/moi", moiRoutes);
app.use("/api/events/:eventId", reportsRoutes);
app.use("/api/writer", writerRoutes);

// 404 handler
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Moi Gold API running on http://localhost:${PORT}`));
