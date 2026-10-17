import test from "node:test";
import assert from "node:assert/strict";
import { manualWeeklyAwardActivityQuerySchema } from "../src/validations/adminValidation.js";

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
