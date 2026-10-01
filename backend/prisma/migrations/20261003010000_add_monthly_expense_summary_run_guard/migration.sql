-- Additive Phase 1 migration: month-level send lock and per-attempt Meta message IDs.
CREATE TABLE "monthly_expense_summary_runs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(), "hub_id" UUID NOT NULL, "period" VARCHAR(7) NOT NULL,
    "state" VARCHAR(32) NOT NULL, "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3), "failed_before_send_at" TIMESTAMP(3), "error_message" TEXT,
    CONSTRAINT "monthly_expense_summary_runs_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "notification_logs" ADD COLUMN "run_id" UUID, ADD COLUMN "meta_message_id" TEXT, ADD COLUMN "accepted_at" TIMESTAMP(3);
CREATE UNIQUE INDEX "monthly_expense_summary_runs_hub_id_period_key" ON "monthly_expense_summary_runs"("hub_id", "period");
CREATE INDEX "monthly_expense_summary_runs_state_started_at_idx" ON "monthly_expense_summary_runs"("state", "started_at");
CREATE UNIQUE INDEX "notification_logs_meta_message_id_key" ON "notification_logs"("meta_message_id");
CREATE INDEX "notification_logs_run_id_member_id_sent_at_idx" ON "notification_logs"("run_id", "member_id", "sent_at");
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "monthly_expense_summary_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- Historical rows did not retain Meta IDs. A successful legacy row proves a summary
-- was submitted, so one COMPLETED run is backfilled per hub/month and blocks a replay.
-- This includes the six September 2026 rows for the affected hub.
INSERT INTO "monthly_expense_summary_runs" ("hub_id", "period", "state", "started_at", "completed_at", "error_message")
SELECT "hub_id", "period", 'COMPLETED', MIN("sent_at"), MAX("sent_at"), 'Backfilled from legacy successful notification logs; device delivery is unknown.'
FROM "notification_logs" WHERE "type" = 'MONTHLY_EXPENSE_SUMMARY' AND "status" = 'success'
GROUP BY "hub_id", "period" ON CONFLICT ("hub_id", "period") DO NOTHING;
