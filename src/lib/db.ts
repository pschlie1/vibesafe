import { PrismaClient } from "@prisma/client";
// Validate required env vars at startup (fail-fast before any DB connection attempt)
import "@/lib/env";

declare global {
  var prisma: PrismaClient | undefined;
}

export const db =
  global.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") global.prisma = db;
