ALTER TYPE "UserStatus" ADD VALUE IF NOT EXISTS 'DELETED';
ALTER TYPE "MembershipStatus" ADD VALUE IF NOT EXISTS 'DELETED';

ALTER TABLE "memberships"
  ADD COLUMN IF NOT EXISTS "suspended_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "auto_delete_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "previous_status" "MembershipStatus";

CREATE INDEX IF NOT EXISTS "memberships_membership_status_auto_delete_at_idx"
  ON "memberships"("membership_status", "auto_delete_at");
CREATE INDEX IF NOT EXISTS "memberships_deleted_at_idx" ON "memberships"("deleted_at");
