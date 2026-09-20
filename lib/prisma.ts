// avoid Prisma multiple instances
import { PrismaClient } from "@prisma/client";

const params = {
  omit: {
    user: { password: true },
  },
};
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient(params);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
