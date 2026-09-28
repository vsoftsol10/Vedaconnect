UPDATE "member_profiles"
SET "date_of_birth" = make_date(2000, EXTRACT(MONTH FROM "date_of_birth")::int, EXTRACT(DAY FROM "date_of_birth")::int)
WHERE "date_of_birth" IS NOT NULL;
