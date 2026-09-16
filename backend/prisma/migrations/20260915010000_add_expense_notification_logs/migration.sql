CREATE TABLE "notification_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "member_id" UUID NOT NULL,
  "hub_id" UUID NOT NULL,
  "type" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "error_message" TEXT,
  "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "notification_logs_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "notification_logs_hub_id_type_sent_at_idx" ON "notification_logs"("hub_id", "type", "sent_at");
