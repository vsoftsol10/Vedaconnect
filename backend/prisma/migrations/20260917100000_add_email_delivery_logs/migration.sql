CREATE TABLE "email_delivery_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "member_id" UUID NOT NULL,
  "template" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "brevo_message_id" TEXT,
  "error_message" TEXT,
  "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "email_delivery_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "email_delivery_logs_member_id_template_sent_at_idx" ON "email_delivery_logs"("member_id", "template", "sent_at");
ALTER TABLE "email_delivery_logs" ADD CONSTRAINT "email_delivery_logs_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
