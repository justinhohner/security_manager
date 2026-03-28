// ABOUTME: Creates the shared Prisma client used by the application runtime.
// ABOUTME: Reuses one client across reloads so local development stays stable.
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
