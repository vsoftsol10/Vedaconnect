import test from "node:test";
import assert from "node:assert/strict";

process.env.JWT_SECRET = "onboarding-session-test-secret";
const { createOnboardingSession, requireOnboardingSession } = await import("../src/middleware/onboardingSessionMiddleware.js");

const runMiddleware = (req) => new Promise((resolve) => {
  requireOnboardingSession(req, {}, (error) => resolve({ error, session: req.onboardingSession }));
});

test("manual payment submission rejects a request without an onboarding session", async () => {
  const { error } = await runMiddleware({ headers: {}, body: { userId: "guessed-uuid" } });
  assert.equal(error.statusCode, 401);
});

test("manual payment submission binds identity to the signed session, not a request body userId", async () => {
  const sessionUserId = "5ec1542f-40c1-47d3-b5e4-0d523b07c950";
  const token = createOnboardingSession(sessionUserId);
  const { error, session } = await runMiddleware({
    headers: { authorization: `Bearer ${token}` },
    body: { userId: "4ed48f3a-fde5-40bd-a87a-03a0b7a65f0f" },
  });
  assert.equal(error, undefined);
  assert.equal(session.userId, sessionUserId);
});
