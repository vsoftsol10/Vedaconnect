import test from "node:test";
import assert from "node:assert/strict";
import { forgotPasswordSchema } from "../src/validations/authValidation.js";

test("forgot-password accepts a Member ID and rejects the retired email identifier payload", () => {
  assert.equal(forgotPasswordSchema.safeParse({ memberId: "VC-FM-00001" }).success, true);
  assert.equal(forgotPasswordSchema.safeParse({ identifier: "member@example.com" }).success, false);
});
