UPDATE "membership_plans"
SET
  "name" = 'Member Onboarding',
  "billing_cycle" = '12 Months',
  "description" = CASE
    WHEN "description" = 'Founder membership with GST included' THEN 'Member onboarding with GST included'
    ELSE "description"
  END,
  "updated_at" = CURRENT_TIMESTAMP
WHERE "plan_code" = 'FOUNDING_MEMBER';
