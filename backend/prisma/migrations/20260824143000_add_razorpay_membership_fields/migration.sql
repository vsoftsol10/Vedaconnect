ALTER TABLE "memberships"
ADD COLUMN IF NOT EXISTS "razorpay_order_id" TEXT,
ADD COLUMN IF NOT EXISTS "razorpay_payment_id" TEXT,
ADD COLUMN IF NOT EXISTS "razorpay_signature" TEXT,
ADD COLUMN IF NOT EXISTS "paid_at" TIMESTAMP(3);
