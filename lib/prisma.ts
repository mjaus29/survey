import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export default globalForPrisma.prisma || new PrismaClient();
