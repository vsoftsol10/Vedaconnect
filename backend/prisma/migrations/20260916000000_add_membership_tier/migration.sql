-- A member's tier is their first successful membership-payment tier and is immutable.
CREATE TYPE "MembershipTier" AS ENUM ('FOUNDING_MEMBER', 'MEMBER');

ALTER TABLE "users" ADD COLUMN "membership_tier" "MembershipTier";

-- Preserve the tier for already-paid members without assigning one to unpaid records.
UPDATE "users" AS u
SET "membership_tier" = CASE
  WHEN m."membership_type" ILIKE '%FOUNDING%' THEN 'FOUNDING_MEMBER'::"MembershipTier"
  ELSE 'MEMBER'::"MembershipTier"
END
FROM "memberships" AS m
WHERE m."user_id" = u."id"
  AND m."payment_status" = 'PAID';
