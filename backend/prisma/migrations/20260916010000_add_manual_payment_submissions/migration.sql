CREATE TYPE "ManualPaymentSubmissionStatus" AS ENUM ('SUBMITTED', 'VERIFIED', 'REJECTED');

CREATE TABLE "manual_payment_submissions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "membership_id" UUID NOT NULL,
  "reference" TEXT,
  "ip_address" TEXT,
  "status" "ManualPaymentSubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
  "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "verified_at" TIMESTAMP(3),
  "verified_by" UUID,
  CONSTRAINT "manual_payment_submissions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "manual_payment_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "manual_payment_submissions_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "memberships"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "manual_payment_submissions_membership_id_status_submitted_at_idx" ON "manual_payment_submissions"("membership_id", "status", "submitted_at");
CREATE INDEX "manual_payment_submissions_user_id_submitted_at_idx" ON "manual_payment_submissions"("user_id", "submitted_at");
