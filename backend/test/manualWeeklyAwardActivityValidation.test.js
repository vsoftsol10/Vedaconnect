import test from "node:test";
import assert from "node:assert/strict";
import {
  manualWeeklyAwardActivityQuerySchema,
  memberAwardActivityParamsSchema,
  memberAwardActivitySchema,
} from "../src/validations/adminValidation.js";

test("manual award activity query accepts a member and Saturday week start", () => {
  const result = manualWeeklyAwardActivityQuerySchema.safeParse({
    userId: "b1c46e1c-c08a-4c59-9158-c456ae6912b0",
    weekStart: "2026-10-17",
  });
  assert.equal(result.success, true);
});

test("manual award activity query rejects invalid members and non-Saturday dates", () => {
  const invalidUser = manualWeeklyAwardActivityQuerySchema.safeParse({
    userId: "not-a-uuid",
    weekStart: "2026-10-17",
  });
  const invalidWeek = manualWeeklyAwardActivityQuerySchema.safeParse({
    userId: "b1c46e1c-c08a-4c59-9158-c456ae6912b0",
    weekStart: "2026-10-18",
  });
  assert.equal(invalidUser.success, false);
  assert.equal(invalidWeek.success, false);
});

test("member award activity updates accept referral and business entries with non-negative amounts", () => {
  const referralParams = memberAwardActivityParamsSchema.safeParse({
    type: "referral",
    id: "b1c46e1c-c08a-4c59-9158-c456ae6912b0",
  });
  const businessParams = memberAwardActivityParamsSchema.safeParse({
    type: "business",
    id: "b1c46e1c-c08a-4c59-9158-c456ae6912b0",
  });
  assert.equal(memberAwardActivityParamsSchema.safeParse({
    type: "invalid",
    id: "b1c46e1c-c08a-4c59-9158-c456ae6912b0",
  }).success, false);
  assert.equal(referralParams.success, true);
  assert.equal(businessParams.success, true);
  assert.equal(memberAwardActivitySchema.safeParse({ amount: "125.50" }).success, true);
  assert.equal(memberAwardActivitySchema.safeParse({ amount: "-1" }).success, false);
});
