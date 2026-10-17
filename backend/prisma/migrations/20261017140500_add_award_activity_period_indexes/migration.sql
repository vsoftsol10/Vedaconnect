CREATE INDEX IF NOT EXISTS "referrals_given_week_start_idx"
ON "referrals_given"("week_start");

CREATE INDEX IF NOT EXISTS "business_received_week_start_idx"
ON "business_received"("week_start");
