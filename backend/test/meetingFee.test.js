import assert from "node:assert/strict";
import test from "node:test";
import {
  getMeetingFeeAmount,
  getSaturdaysInMonth,
  MEETING_FEE_PER_SATURDAY,
} from "../src/utils/meetingFee.js";

test("meeting fee is calculated from the number of Saturdays in a month", () => {
  assert.equal(MEETING_FEE_PER_SATURDAY, 450);
  assert.equal(getSaturdaysInMonth("2026-10"), 5);
  assert.equal(getMeetingFeeAmount("2026-10"), 2250);
  assert.equal(getSaturdaysInMonth("2026-11"), 4);
  assert.equal(getMeetingFeeAmount("2026-11"), 1800);
});

test("meeting fee calculation validates the month key", () => {
  assert.throws(() => getSaturdaysInMonth("2026-13"), RangeError);
  assert.throws(() => getMeetingFeeAmount("October 2026"), RangeError);
});
