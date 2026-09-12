-- Support imported offline members whose contact details are not yet known.
CREATE TYPE "OnboardingStatus" AS ENUM ('ONLINE', 'MANUAL', 'PRE_ONBOARDED');

ALTER TABLE "users"
  ALTER COLUMN "email" DROP NOT NULL;

ALTER TABLE "member_profiles"
  ALTER COLUMN "phone" DROP NOT NULL,
  ADD COLUMN "onboarding_status" "OnboardingStatus" NOT NULL DEFAULT 'ONLINE';
