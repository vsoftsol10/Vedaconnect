-- Preserve every existing enum value verbatim while removing the enum constraint.
ALTER TABLE "expenses" ALTER COLUMN "category" TYPE VARCHAR(60) USING "category"::text;
DROP TYPE "ExpenseCategory";
