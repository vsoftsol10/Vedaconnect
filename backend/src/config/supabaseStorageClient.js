import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env. " +
      "These are only used for Storage (certificate uploads) - all table data goes through Prisma."
  );
}

/**
 * Used ONLY for Supabase Storage (business certificate files).
 * All database table reads/writes go through Prisma (prismaClient.js), not this.
 * Uses the service role key, so it must never run in the frontend.
 */
const supabaseProjectUrl = new URL(SUPABASE_URL).origin;

export const supabaseStorage = createClient(supabaseProjectUrl, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
