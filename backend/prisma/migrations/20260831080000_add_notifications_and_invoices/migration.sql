-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "audience" TEXT NOT NULL DEFAULT 'MEMBER',
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_invoices" (
    "id" UUID NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "payment_type" TEXT NOT NULL,
    "payment_record_id" UUID NOT NULL,
    "item_name" TEXT NOT NULL,
    "base_amount" DECIMAL(10,2) NOT NULL,
    "gst_percent" DECIMAL(5,2) NOT NULL DEFAULT 18.00,
    "gst_amount" DECIMAL(10,2) NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "payment_method" TEXT NOT NULL,
    "transaction_id" TEXT,
    "html_snapshot" TEXT NOT NULL,
    "emailed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_created_at_idx" ON "notifications"("user_id", "is_read", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "payment_invoices_invoice_number_key" ON "payment_invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "payment_invoices_user_id_payment_type_created_at_idx" ON "payment_invoices"("user_id", "payment_type", "created_at");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_invoices" ADD CONSTRAINT "payment_invoices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
