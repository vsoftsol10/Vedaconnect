ALTER TABLE "member_profiles" ADD COLUMN "date_of_birth" DATE;

UPDATE "member_profiles" SET "date_of_birth" = make_date(2000, EXTRACT(MONTH FROM "date_of_birth")::int, EXTRACT(DAY FROM "date_of_birth")::int) WHERE "date_of_birth" IS NOT NULL;

CREATE TABLE "birthday_reminders" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "member_id" UUID NOT NULL,
  "year" INTEGER NOT NULL,
  "reminder_type" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "birthday_reminders_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "birthday_reminders_member_id_year_reminder_type_key" ON "birthday_reminders"("member_id", "year", "reminder_type");
ALTER TABLE "birthday_reminders" ADD CONSTRAINT "birthday_reminders_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
