import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { applyWhatsAppStatus, mapWhatsAppStatus, verifyWhatsAppChallenge, verifyWhatsAppSignature } from "../src/services/whatsappWebhookService.js";

const secret = "unit-test-secret";
const body = Buffer.from('{"object":"whatsapp_business_account"}');
const signature = `sha256=${crypto.createHmac("sha256", secret).update(body).digest("hex")}`;

test("webhook verification only accepts the configured subscribe token", () => {
  assert.equal(verifyWhatsAppChallenge({ mode: "subscribe", token: "right", challenge: "challenge", verifyToken: "right" }), "challenge");
  assert.equal(verifyWhatsAppChallenge({ mode: "subscribe", token: "wrong", challenge: "challenge", verifyToken: "right" }), null);
});

test("webhook signature verification validates a SHA-256 HMAC", () => {
  assert.equal(verifyWhatsAppSignature({ rawBody: body, signature, appSecret: secret }), true);
  assert.equal(verifyWhatsAppSignature({ rawBody: body, signature: "sha256:not-valid", appSecret: secret }), false);
});

test("Meta delivery statuses map to persisted status and lifecycle rank", () => {
  assert.deepEqual(mapWhatsAppStatus("sent"), { status: "sent", rank: 1 });
  assert.deepEqual(mapWhatsAppStatus("delivered"), { status: "delivered", rank: 2 });
  assert.deepEqual(mapWhatsAppStatus("read"), { status: "read", rank: 3 });
  assert.deepEqual(mapWhatsAppStatus("failed"), { status: "failed", rank: 1 });
  assert.equal(mapWhatsAppStatus("unknown"), null);
});

const database = (row) => ({ notificationLog: {
  findUnique: async () => row,
  update: async ({ data }) => Object.assign(row, data),
} });

test("an older status cannot overwrite a newer delivery state", async () => {
  const row = { id: "row-1", metaMessageId: "wamid.1", status: "delivered", statusRank: 2, statusAt: new Date("2026-10-06T08:00:00Z") };
  const result = await applyWhatsAppStatus({ id: "wamid.1", mapped: mapWhatsAppStatus("sent"), statusAt: new Date("2026-10-06T08:01:00Z"), errors: [] }, database(row));
  assert.deepEqual(result, { ignored: true });
  assert.equal(row.status, "delivered");
});

test("an unknown wamid is acknowledged without a database update", async () => {
  const result = await applyWhatsAppStatus({ id: "wamid.unknown", mapped: mapWhatsAppStatus("sent"), statusAt: new Date(), errors: [] }, { notificationLog: { findUnique: async () => null }, whatsAppDeliveryLog: { findFirst: async () => null } });
  assert.deepEqual(result, { unknown: true });
});
