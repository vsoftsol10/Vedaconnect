import test from "node:test";
import assert from "node:assert/strict";
import { isPastAutoDeleteDate, reactivationFields, suspensionFields } from "../src/utils/memberLifecycle.js";

test("suspending records an exact timestamp and a six-month deletion date", () => {
  const now = new Date("2026-01-15T10:00:00.000Z");
  const fields = suspensionFields("ACTIVE", now);
  assert.equal(fields.membershipStatus, "SUSPENDED");
  assert.equal(fields.suspendedAt, now);
  assert.equal(fields.autoDeleteAt.toISOString(), "2026-07-15T10:00:00.000Z");
});

test("reactivation restores the previous state and clears deletion timestamps", () => {
  assert.deepEqual(reactivationFields("PENDING_PAYMENT"), {
    membershipStatus: "PENDING_PAYMENT", previousStatus: null, suspendedAt: null, autoDeleteAt: null,
  });
});

test("auto-delete eligibility includes only expired, non-deleted suspended members", () => {
  const now = new Date("2026-08-01T00:00:00.000Z");
  assert.equal(isPastAutoDeleteDate({ membershipStatus: "SUSPENDED", autoDeleteAt: "2026-07-31T00:00:00.000Z", deletedAt: null }, now), true);
  assert.equal(isPastAutoDeleteDate({ membershipStatus: "SUSPENDED", autoDeleteAt: "2026-08-02T00:00:00.000Z", deletedAt: null }, now), false);
  assert.equal(isPastAutoDeleteDate({ membershipStatus: "ACTIVE", autoDeleteAt: "2026-07-31T00:00:00.000Z", deletedAt: null }, now), false);
  assert.equal(isPastAutoDeleteDate({ membershipStatus: "SUSPENDED", autoDeleteAt: "2026-07-31T00:00:00.000Z", deletedAt: "2026-07-31T01:00:00.000Z" }, now), false);
});
