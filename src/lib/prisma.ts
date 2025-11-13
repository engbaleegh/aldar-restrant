
// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

import { Environments } from "@/constants/enums";
import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === Environments.DEV
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== Environments.PROD) globalForPrisma.prisma = db;
