import { PrismaClient } from "@prisma/client";

// Below prevents PrismaClient from duplicating in dev mode.
declare global {
  var prisma: PrismaClient | undefined;
}

// biome-ignore lint: this is to prevent prisma from duplicating in dev mode
const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export default prisma;
