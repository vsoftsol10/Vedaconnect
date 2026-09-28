-- Manual collections reuse the existing monthly fee record. Existing payments remain ONLINE.
ALTER TABLE "meeting_fee_payments"
  ADD COLUMN "payment_source" TEXT NOT NULL DEFAULT 'ONLINE',
  ADD COLUMN "payment_mode" TEXT,
  ADD COLUMN "note" VARCHAR(200),
  ADD COLUMN "receipt_path" TEXT,
  ADD COLUMN "recorded_by" UUID,
  ADD COLUMN "recorded_at" TIMESTAMP(3),
  ADD COLUMN "meeting_week" TIMESTAMP(3);

CREATE INDEX "meeting_fee_payments_payment_source_month_idx"
  ON "meeting_fee_payments"("payment_source", "month");
