import assert from "node:assert/strict";
import test from "node:test";
import { buildWeeklyAwardTotals } from "../src/services/networkingService.js";

test("weekly award totals combine portal activity by member and week", () => {
  const totals = buildWeeklyAwardTotals(
    [],
    [
      {
        giverId: "member-1",
        weekStart: new Date("2026-10-10T00:00:00.000Z"),
        receiverType: "MEMBER",
        amount: 250,
      },
      {
        giverId: "member-1",
        weekStart: new Date("2026-10-10T00:00:00.000Z"),
        receiverType: "MEMBER",
        amount: 150,
      },
      {
        giverId: "member-1",
        weekStart: new Date("2026-10-10T00:00:00.000Z"),
        receiverType: "EXTERNAL",
        amount: 1000,
      },
    ],
    [
      {
        receiverId: "member-1",
        weekStart: new Date("2026-10-10T00:00:00.000Z"),
        referrerType: "MEMBER",
        amount: 700,
      },
    ],
  );

  assert.deepEqual(totals, [{
    userId: "member-1",
    weekStart: "2026-10-10",
    referralAmount: 400,
    referralCount: 2,
    businessAmount: 700,
    businessCount: 1,
  }]);
});

test("manual weekly award totals replace member portal amounts and counts", () => {
  const totals = buildWeeklyAwardTotals(
    [{
      userId: "member-1",
      weekStart: new Date("2026-10-10T00:00:00.000Z"),
      referralAmount: 50,
      referralCount: 1,
      businessAmount: 0,
      businessCount: 0,
    }],
    [{
      giverId: "member-1",
      weekStart: new Date("2026-10-10T00:00:00.000Z"),
      receiverType: "MEMBER",
      amount: 400,
    }],
    [{
      receiverId: "member-1",
      weekStart: new Date("2026-10-10T00:00:00.000Z"),
      referrerType: "MEMBER",
      amount: 700,
    }],
  );

  assert.deepEqual(totals, [{
    userId: "member-1",
    weekStart: "2026-10-10",
    referralAmount: 50,
    referralCount: 1,
    businessAmount: 0,
    businessCount: 0,
  }]);
});
