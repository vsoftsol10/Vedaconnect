CREATE INDEX "meeting_attendance_week_start_responded_at_idx" ON "meeting_attendance"("week_start", "responded_at");
CREATE INDEX "meeting_fee_payments_month_paid_at_idx" ON "meeting_fee_payments"("month", "paid_at");
CREATE INDEX "meeting_fee_payments_month_amount_idx" ON "meeting_fee_payments"("month", "amount");
