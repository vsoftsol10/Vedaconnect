CREATE SEQUENCE IF NOT EXISTS member_id_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION next_member_id()
RETURNS bigint
LANGUAGE sql
AS $$
  SELECT nextval('member_id_seq');
$$;

INSERT INTO "membership_plans" (
  "id",
  "plan_code",
  "name",
  "badge",
  "amount",
  "billing_cycle",
  "benefits",
  "is_active",
  "created_at",
  "updated_at"
)
VALUES (
  '11111111-1111-4111-8111-111111111111',
  'FOUNDING_MEMBER',
  'Founder Member',
  'POPULAR',
  7500.00,
  'LIFETIME',
  '[
    "Lifetime access",
    "Community events",
    "Member directory",
    "Priority registration",
    "Networking sessions",
    "Business showcase",
    "Member-only workshops",
    "Founding member badge",
    "Community leadership",
    "Exclusive founder events",
    "Featured business profile"
  ]'::jsonb,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("plan_code") DO UPDATE SET
  "name" = EXCLUDED."name",
  "badge" = EXCLUDED."badge",
  "amount" = EXCLUDED."amount",
  "billing_cycle" = EXCLUDED."billing_cycle",
  "benefits" = EXCLUDED."benefits",
  "is_active" = EXCLUDED."is_active",
  "updated_at" = CURRENT_TIMESTAMP;
