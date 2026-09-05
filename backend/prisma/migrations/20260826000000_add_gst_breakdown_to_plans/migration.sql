ALTER TABLE "membership_plans" ADD COLUMN "base_amount" DECIMAL(10,2);
ALTER TABLE "membership_plans" ADD COLUMN "gst_percent" DECIMAL(5,2) NOT NULL DEFAULT 18.00;

UPDATE "membership_plans"
SET
  "base_amount" = 7000.00,
  "gst_percent" = 18.00,
  "amount" = 8260.00,
  "updated_at" = CURRENT_TIMESTAMP
WHERE "plan_code" = 'FOUNDING_MEMBER';

UPDATE "membership_plans"
SET "base_amount" = ROUND(("amount" / 1.18)::numeric, 2)
WHERE "base_amount" IS NULL;

ALTER TABLE "membership_plans" ALTER COLUMN "base_amount" SET NOT NULL;
