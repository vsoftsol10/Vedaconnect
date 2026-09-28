ALTER TABLE "events" ADD COLUMN "hub_id" UUID;
CREATE INDEX "events_hub_id_idx" ON "events"("hub_id");
ALTER TABLE "events" ADD CONSTRAINT "events_hub_id_fkey" FOREIGN KEY ("hub_id") REFERENCES "hubs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
