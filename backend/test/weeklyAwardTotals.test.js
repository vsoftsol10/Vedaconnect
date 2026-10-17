import assert from "node:assert/strict";
import test from "node:test";
import { buildWeeklyAwardTotals, selectLeaderboardRows } from "../src/services/networkingService.js";
import { leaderboardQuerySchema } from "../src/validations/networkingValidation.js";

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

test("leaderboard winner selection returns one deterministic top scorer", () => {
  const totals = [
    { userId: "leader-1", referralAmount: 900, referralCount: 2 },
    { userId: "leader-2", referralAmount: 900, referralCount: 3 },
    { userId: "member-3", referralAmount: 700, referralCount: 1 },
  ];

  assert.deepEqual(
    selectLeaderboardRows(totals, "referralAmount", "referralCount", { winnersOnly: true }),
    [
      { giverId: "leader-1", _sum: { amount: 900 }, _count: { _all: 2 } },
    ],
  );
});

test("leaderboard query accepts winner-only mode without changing the default", () => {
  assert.equal(leaderboardQuerySchema.parse({ winnersOnly: "true" }).winnersOnly, true);
  assert.equal(leaderboardQuerySchema.parse({}).winnersOnly, false);
});
