const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

const shutdown = async () => {
  try {
    await prisma.$disconnect();
  } catch {
    /* ignore */
  }
};

process.once("beforeExit", shutdown);
process.once("SIGINT", async () => { await shutdown(); process.exit(0); });
process.once("SIGTERM", async () => { await shutdown(); process.exit(0); });

module.exports = prisma;
