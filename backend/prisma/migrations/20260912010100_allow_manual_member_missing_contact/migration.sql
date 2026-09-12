-- Offline records may be added before a primary contact has been collected.
ALTER TABLE "member_profiles"
  ALTER COLUMN "full_name" DROP NOT NULL;
