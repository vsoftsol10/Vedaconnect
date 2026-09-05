CREATE TYPE "NetworkingPartyType" AS ENUM ('member', 'external');

CREATE TABLE IF NOT EXISTS "referrals_given" (
  "id" UUID NOT NULL,
  "giver_id" UUID NOT NULL,
  "receiver_id" UUID NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "description" TEXT,
  "week_start" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "referrals_given_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "business_received" (
  "id" UUID NOT NULL,
  "receiver_id" UUID NOT NULL,
  "referrer_id" UUID NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "description" TEXT,
  "week_start" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "business_received_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "referrals_given_giver_id_week_start_idx" ON "referrals_given"("giver_id", "week_start");
CREATE INDEX IF NOT EXISTS "referrals_given_receiver_id_week_start_idx" ON "referrals_given"("receiver_id", "week_start");
CREATE INDEX IF NOT EXISTS "business_received_receiver_id_week_start_idx" ON "business_received"("receiver_id", "week_start");
CREATE INDEX IF NOT EXISTS "business_received_referrer_id_week_start_idx" ON "business_received"("referrer_id", "week_start");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'referrals_given_giver_id_fkey') THEN
    ALTER TABLE "referrals_given"
      ADD CONSTRAINT "referrals_given_giver_id_fkey"
      FOREIGN KEY ("giver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'referrals_given_receiver_id_fkey') THEN
    ALTER TABLE "referrals_given"
      ADD CONSTRAINT "referrals_given_receiver_id_fkey"
      FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'business_received_receiver_id_fkey') THEN
    ALTER TABLE "business_received"
      ADD CONSTRAINT "business_received_receiver_id_fkey"
      FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'business_received_referrer_id_fkey') THEN
    ALTER TABLE "business_received"
      ADD CONSTRAINT "business_received_referrer_id_fkey"
      FOREIGN KEY ("referrer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE "referrals_given"
  ADD COLUMN "receiver_type" "NetworkingPartyType" NOT NULL DEFAULT 'member',
  ADD COLUMN "external_name" TEXT,
  ADD COLUMN "external_business" TEXT,
  ADD COLUMN "external_contact" TEXT;

ALTER TABLE "business_received"
  ADD COLUMN "referrer_type" "NetworkingPartyType" NOT NULL DEFAULT 'member',
  ADD COLUMN "external_name" TEXT,
  ADD COLUMN "external_business" TEXT,
  ADD COLUMN "external_contact" TEXT;

ALTER TABLE "referrals_given" DROP CONSTRAINT IF EXISTS "referrals_given_receiver_id_fkey";
ALTER TABLE "referrals_given" ALTER COLUMN "receiver_id" DROP NOT NULL;
ALTER TABLE "referrals_given"
  ADD CONSTRAINT "referrals_given_receiver_id_fkey"
  FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "business_received" DROP CONSTRAINT IF EXISTS "business_received_referrer_id_fkey";
ALTER TABLE "business_received" ALTER COLUMN "referrer_id" DROP NOT NULL;
ALTER TABLE "business_received"
  ADD CONSTRAINT "business_received_referrer_id_fkey"
  FOREIGN KEY ("referrer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "referrals_given_receiver_type_created_at_idx" ON "referrals_given"("receiver_type", "created_at");
CREATE INDEX IF NOT EXISTS "business_received_referrer_type_created_at_idx" ON "business_received"("referrer_type", "created_at");
