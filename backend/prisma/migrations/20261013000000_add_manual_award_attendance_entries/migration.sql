ALTER TABLE "meeting_attendance"
ADD COLUMN "source" TEXT NOT NULL DEFAULT 'ONLINE';

CREATE TABLE "manual_weekly_award_entries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "week_start" TIMESTAMP(3) NOT NULL,
    "referral_count" INTEGER NOT NULL DEFAULT 0,
    "referral_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "business_count" INTEGER NOT NULL DEFAULT 0,
    "business_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manual_weekly_award_entries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "manual_weekly_award_entries_user_id_week_start_key"
ON "manual_weekly_award_entries"("user_id", "week_start");

CREATE INDEX "manual_weekly_award_entries_week_start_idx"
ON "manual_weekly_award_entries"("week_start");

ALTER TABLE "manual_weekly_award_entries"
ADD CONSTRAINT "manual_weekly_award_entries_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
