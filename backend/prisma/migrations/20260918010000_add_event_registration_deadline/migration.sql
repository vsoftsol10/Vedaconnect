ALTER TABLE "events"
ADD COLUMN "registration_deadline" TIMESTAMP(3);

UPDATE "events"
SET "registration_deadline" = "event_date"
WHERE "event_type" = 'FEE'
  AND "registration_deadline" IS NULL;
