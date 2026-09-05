import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const withOptionalPrismaSslMode = (value) => {
  if (!value) return value;

  const url = new URL(value);
  if (process.env.PRISMA_SSL_MODE) {
    url.searchParams.set("sslmode", process.env.PRISMA_SSL_MODE);
  } else if (
    process.env.NODE_ENV !== "production" &&
    url.hostname.endsWith(".pooler.supabase.com") &&
    !url.searchParams.has("sslmode")
  ) {
    url.searchParams.set("sslmode", "disable");
  }

  return url.toString();
};

/**
 * Single shared Prisma instance. Talks directly to your Supabase Postgres
 * database using DATABASE_URL / DIRECT_URL from .env — not the Supabase
 * JS SDK. All table reads/writes go through this client.
 */
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: withOptionalPrismaSslMode(process.env.DATABASE_URL || process.env.DIRECT_URL),
    },
  },
});
