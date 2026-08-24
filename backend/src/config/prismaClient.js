import { PrismaClient } from "@prisma/client";

/**
 * Single shared Prisma instance. Talks directly to your Supabase Postgres
 * database using DATABASE_URL / DIRECT_URL from .env — not the Supabase
 * JS SDK. All table reads/writes go through this client.
 */
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});
