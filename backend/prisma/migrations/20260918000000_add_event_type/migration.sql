-- Keep all existing events fee-based, then distinguish informational weekly meetings.
CREATE TYPE "EventType" AS ENUM ('FEE', 'NO_FEE');

ALTER TABLE "events"
ADD COLUMN "event_type" "EventType" NOT NULL DEFAULT 'FEE';
