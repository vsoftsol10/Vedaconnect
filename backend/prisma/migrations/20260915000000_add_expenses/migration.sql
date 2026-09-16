CREATE TYPE "ExpenseCategory" AS ENUM ('VENUE', 'FOOD', 'PRINTING', 'DECORATION', 'GUEST_SPEAKER', 'MISCELLANEOUS', 'OTHER');

CREATE TABLE "expenses" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "hub_id" UUID NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "category" "ExpenseCategory" NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "description" TEXT NOT NULL,
  "receipt_url" TEXT,
  "created_by" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "expenses_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "expenses_hub_id_fkey" FOREIGN KEY ("hub_id") REFERENCES "hubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "expenses_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "expenses_hub_id_date_idx" ON "expenses"("hub_id", "date");
