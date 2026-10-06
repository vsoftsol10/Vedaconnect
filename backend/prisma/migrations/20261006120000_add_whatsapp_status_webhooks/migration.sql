-- Additive only: historical send records remain untouched.
ALTER TABLE "notification_logs"
  ADD COLUMN "status_at" TIMESTAMP(3),
  ADD COLUMN "status_rank" INTEGER,
  ADD COLUMN "error_code" TEXT,
  ADD COLUMN "error_title" TEXT,
  ADD COLUMN "error_details" TEXT;

CREATE INDEX "notification_logs_meta_message_id_status_rank_idx"
  ON "notification_logs"("meta_message_id", "status_rank");

ALTER TABLE "whatsapp_delivery_logs"
  ADD COLUMN "accepted_at" TIMESTAMP(3),
  ADD COLUMN "status_at" TIMESTAMP(3),
  ADD COLUMN "status_rank" INTEGER,
  ADD COLUMN "error_code" TEXT,
  ADD COLUMN "error_title" TEXT,
  ADD COLUMN "error_details" TEXT;

CREATE INDEX "whatsapp_delivery_logs_meta_message_id_status_rank_idx"
  ON "whatsapp_delivery_logs"("meta_message_id", "status_rank");
