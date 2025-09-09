import { PrismaClient } from "./generated/client";

// Create and configure Prisma client instance
const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"]
      : ["warn", "error"],
});

export type { Prisma } from "./generated/client";
export { prisma };
