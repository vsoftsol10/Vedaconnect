ALTER TABLE "membership_plans" ADD COLUMN IF NOT EXISTS "description" TEXT;

UPDATE "membership_plans"
SET
  "base_amount" = 13000.00,
  "gst_percent" = 18.00,
  "amount" = 15340.00,
  "description" = COALESCE("description", 'Founder membership with GST included'),
  "updated_at" = CURRENT_TIMESTAMP
WHERE "plan_code" = 'FOUNDING_MEMBER';
