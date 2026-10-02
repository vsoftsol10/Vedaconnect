import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import express from "express";
import expenseRoutes from "../src/routes/expenseRoutes.js";
import { errorHandler } from "../src/middleware/errorHandler.js";
import { __resetMonthlyExpensePdfSendLockForTests, previewMonthlyExpensePdfRecipients, sendMonthlyExpenseSummaryPdfForHub, validateAccountsPdf } from "../src/services/monthlyExpensePdfNotificationService.js";
import { runMonthlyExpenseNotificationJob } from "../src/jobs/monthlyExpenseNotificationJob.js";
import { sendWhatsAppDocumentTemplate } from "../src/utils/whatsappNotify.js";
import { expenseNotificationSchema } from "../src/validations/expenseValidation.js";

const hubId = "a0c69832-6015-4601-a96f-fa06a79452a4";
const pdf = () => ({ mimetype: "application/pdf", size: 8, buffer: Buffer.from("%PDF-1.7") });
const member = (id, name, phone) => ({ id, memberProfile: { fullName: name, phone } });
const fakePrisma = (members = [member("one", "Asha", "919999999803")]) => {
  const runs = []; let nextRunId = 1;
  const matchingRun = (where) => where.id ? runs.find((run) => run.id === where.id) : runs.find((run) => run.hubId === where.hubId_period.hubId && run.period === where.hubId_period.period);
  return {
  hub: { findUnique: async () => ({ name: "Tirunelveli" }) },
  user: { findMany: async () => members },
  notificationLog: { create: async () => ({}) },
  monthlyExpenseSummaryRun: {
    findUnique: async ({ where }) => matchingRun(where) || null,
    create: async ({ data }) => { if (runs.some((run) => run.hubId === data.hubId && run.period === data.period)) { const error = new Error("Unique constraint"); error.code = "P2002"; throw error; } const run = { id: String(nextRunId++), ...data, startedAt: new Date() }; runs.push(run); return run; },
    updateMany: async ({ where, data }) => { const run = matchingRun(where); if (!run || (where.state && run.state !== where.state)) return { count: 0 }; Object.assign(run, data); return { count: 1 }; },
    update: async ({ where, data }) => { const run = matchingRun(where); Object.assign(run, data); return run; },
  },
  __runs: runs,
};
};
const withTemplate = async (value, callback) => {
  const previous = process.env.WHATSAPP_EXPENSE_SUMMARY_PDF_TEMPLATE; const previousNotifications = process.env.ENABLE_WHATSAPP_NOTIFICATIONS;
  if (value === undefined) delete process.env.WHATSAPP_EXPENSE_SUMMARY_PDF_TEMPLATE;
  else process.env.WHATSAPP_EXPENSE_SUMMARY_PDF_TEMPLATE = value;
  process.env.ENABLE_WHATSAPP_NOTIFICATIONS = "true";
  try { return await callback(); } finally { if (previous === undefined) delete process.env.WHATSAPP_EXPENSE_SUMMARY_PDF_TEMPLATE; else process.env.WHATSAPP_EXPENSE_SUMMARY_PDF_TEMPLATE = previous; if (previousNotifications === undefined) delete process.env.ENABLE_WHATSAPP_NOTIFICATIONS; else process.env.ENABLE_WHATSAPP_NOTIFICATIONS = previousNotifications; }
};
const dependencies = (members, metaClient) => ({ prismaClient: fakePrisma(members), getMonthlySummary: async () => ({ totalCollected: 100, totalSpent: 40, balance: 60 }), metaClient });

test("PDF payload has one document header and exactly four body variables", async () => withTemplate("pdf_template", async () => {
  let uploadCount = 0; const payloads = [];
  await sendMonthlyExpenseSummaryPdfForHub({ hubId, month: 9, year: 2026, file: pdf() }, dependencies([member("one", "Asha", "919999999803"), member("two", "Bina", "919999999804")], {
    uploadPdf: async () => { uploadCount += 1; return "media-123"; }, sendDocumentTemplate: async (value) => { payloads.push(value); return {}; },
  }));
  assert.equal(uploadCount, 1); assert.equal(payloads.length, 2); assert.deepEqual(payloads.map((payload) => payload.mediaId), ["media-123", "media-123"]); assert.equal(payloads[0].filename, "Vedaconnect-Tirunelveli-Accounts-September-2026.pdf"); assert.deepEqual(payloads[0].variables, ["September 2026", "100", "40", "60"]);
}));

test("Meta request contains only the required document header and four-variable body", async () => {
  const oldFetch = globalThis.fetch; const oldToken = process.env.META_WHATSAPP_ACCESS_TOKEN; const oldPhoneId = process.env.META_WHATSAPP_PHONE_NUMBER_ID; const oldVersion = process.env.META_GRAPH_API_VERSION; const oldNotifications = process.env.ENABLE_WHATSAPP_NOTIFICATIONS;
  let request;
  process.env.META_WHATSAPP_ACCESS_TOKEN = "test-token"; process.env.META_WHATSAPP_PHONE_NUMBER_ID = "phone-id"; process.env.META_GRAPH_API_VERSION = "v20.0"; process.env.ENABLE_WHATSAPP_NOTIFICATIONS = "true";
  globalThis.fetch = async (url, options) => { request = { url, options }; return { ok: true, status: 200, json: async () => ({ messages: [{ id: "wamid" }] }) }; };
  try {
    await sendWhatsAppDocumentTemplate({ phone: "919999999803", templateName: "pdf_template", mediaId: "media-123", filename: "accounts.pdf", variables: ["September 2026", "100", "40", "60"] });
    const payload = JSON.parse(request.options.body);
    assert.equal(payload.template.language.code, "en_US"); assert.equal(payload.template.components.length, 2);
    assert.deepEqual(payload.template.components[0], { type: "header", parameters: [{ type: "document", document: { id: "media-123", filename: "accounts.pdf" } }] });
    assert.deepEqual(payload.template.components[1], { type: "body", parameters: ["September 2026", "100", "40", "60"].map((text) => ({ type: "text", text })) });
    assert.equal(payload.template.components.some((component) => component.type === "footer" || component.type === "button"), false);
  } finally {
    globalThis.fetch = oldFetch;
    if (oldToken === undefined) delete process.env.META_WHATSAPP_ACCESS_TOKEN; else process.env.META_WHATSAPP_ACCESS_TOKEN = oldToken;
    if (oldPhoneId === undefined) delete process.env.META_WHATSAPP_PHONE_NUMBER_ID; else process.env.META_WHATSAPP_PHONE_NUMBER_ID = oldPhoneId;
    if (oldVersion === undefined) delete process.env.META_GRAPH_API_VERSION; else process.env.META_GRAPH_API_VERSION = oldVersion;
    if (oldNotifications === undefined) delete process.env.ENABLE_WHATSAPP_NOTIFICATIONS; else process.env.ENABLE_WHATSAPP_NOTIFICATIONS = oldNotifications;
  }
});

test("PDF validation rejects wrong MIME, signature, oversized, and empty files", () => {
  assert.throws(() => validateAccountsPdf({ ...pdf(), mimetype: "image/png" }));
  assert.throws(() => validateAccountsPdf({ ...pdf(), buffer: Buffer.from("not-pdf") }));
  assert.throws(() => validateAccountsPdf({ ...pdf(), size: 5 * 1024 * 1024 + 1, buffer: Buffer.concat([Buffer.from("%PDF-"), Buffer.alloc(5 * 1024 * 1024)]) }));
  assert.throws(() => validateAccountsPdf({ ...pdf(), size: 0, buffer: Buffer.alloc(0) }));
});

test("missing PDF template returns 500 before any Meta call", async () => withTemplate(undefined, async () => {
  let calls = 0;
  await assert.rejects(() => sendMonthlyExpenseSummaryPdfForHub({ hubId, month: 9, year: 2026, file: pdf() }, dependencies(undefined, { uploadPdf: async () => { calls += 1; }, sendDocumentTemplate: async () => { calls += 1; } })), { statusCode: 500 });
  assert.equal(calls, 0);
}));

test("media upload failure sends no messages", async () => withTemplate("pdf_template", async () => {
  let messages = 0;
  await assert.rejects(() => sendMonthlyExpenseSummaryPdfForHub({ hubId, month: 9, year: 2026, file: pdf() }, dependencies(undefined, { uploadPdf: async () => { throw new Error("upload failed"); }, sendDocumentTemplate: async () => { messages += 1; } })));
  assert.equal(messages, 0);
}));

test("send stops at the first Meta error and reports prior sends", async () => withTemplate("pdf_template", async () => {
  let sends = 0;
  const logs = []; const original = console.error; console.error = (...args) => logs.push(JSON.stringify(args));
  try {
    const result = await sendMonthlyExpenseSummaryPdfForHub({ hubId, month: 9, year: 2026, file: pdf() }, dependencies([member("one", "Asha", "919999999803"), member("two", "Bina", "919999999804"), member("three", "Chet", "919999999805")], { uploadPdf: async () => "media-123", sendDocumentTemplate: async () => { sends += 1; if (sends === 2) throw new Error("rejected"); } }));
    assert.deepEqual(result, { successCount: 1, failureCount: 1, stopped: true, remainingRecipients: [{ name: "Bina", phone: "91XXXXXX9804" }, { name: "Chet", phone: "91XXXXXX9805" }], message: "Meta rejected a message; sending stopped without retrying." }); assert.equal(sends, 2);
    assert.doesNotMatch(logs.join("\n"), /919999999804/); assert.match(logs.join("\n"), /91XXXXXX9804/);
  } finally { console.error = original; }
}));

test("PDF provider errors redact phones and credentials in logs and notification rows", async () => withTemplate("pdf_template", async () => {
  const logs = []; const rows = []; const original = console.error;
  const secret = "recipient 919999999804 failed: Bearer super-secret-token access_token=also-secret";
  const prismaClient = fakePrisma([member("one", "Asha", "919999999804")]);
  prismaClient.notificationLog.create = async ({ data }) => { rows.push(data); return {}; };
  console.error = (...args) => logs.push(JSON.stringify(args));
  try {
    await sendMonthlyExpenseSummaryPdfForHub({ hubId, month: 9, year: 2026, file: pdf() }, {
      prismaClient,
      getMonthlySummary: async () => ({ totalCollected: 100, totalSpent: 40, balance: 60 }),
      metaClient: { uploadPdf: async () => "media-123", sendDocumentTemplate: async () => { throw new Error(secret); } },
    });
    const output = `${logs.join("\n")}\n${rows[0].errorMessage}`;
    assert.doesNotMatch(output, /919999999804|super-secret-token|also-secret/);
    assert.match(output, /XXXX9804|Bearer \[REDACTED\]|access_token: \[REDACTED\]/);
  } finally { console.error = original; }
}));

test("multipart-style PDF fields are coerced and reach send logic as numbers", async () => withTemplate("pdf_template", async () => {
  const payload = expenseNotificationSchema.parse({ hubId, month: "9", year: "2026" });
  let received;
  await sendMonthlyExpenseSummaryPdfForHub({ ...payload, file: pdf() }, {
    prismaClient: fakePrisma(),
    getMonthlySummary: async (receivedHubId, receivedMonth, receivedYear) => { received = { receivedHubId, receivedMonth, receivedYear }; return { totalCollected: 100, totalSpent: 40, balance: 60 }; },
    metaClient: { uploadPdf: async () => "media-123", sendDocumentTemplate: async () => {} },
  });
  assert.deepEqual(received, { receivedHubId: hubId, receivedMonth: 9, receivedYear: 2026 });
}));

test("invalid notification month or year strings return 400", async () => {
  const app = express(); app.use(express.json()); app.use("/api/expenses", expenseRoutes); app.use(errorHandler);
  process.env.JWT_SECRET = "test-secret";
  const server = await new Promise((resolve) => { const instance = app.listen(0, () => resolve(instance)); });
  const port = server.address().port;
  try {
    const token = jwt.sign({ role: "ADMIN", userId: "admin" }, process.env.JWT_SECRET);
    for (const payload of [{ hubId, month: "nope", year: "2026" }, { hubId, month: "9", year: "nope" }]) {
      const response = await fetch(`http://127.0.0.1:${port}/api/expenses/notify-pdf/preview`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      assert.equal(response.status, 400);
    }
  } finally { await new Promise((resolve) => server.close(resolve)); }
});

test("lock returns 409 while running and releases after success and failure", async () => withTemplate("pdf_template", async () => {
  __resetMonthlyExpensePdfSendLockForTests(); let release; const pending = new Promise((resolve) => { release = resolve; });
  const slow = dependencies(undefined, { uploadPdf: async () => "media-123", sendDocumentTemplate: async () => pending });
  const first = sendMonthlyExpenseSummaryPdfForHub({ hubId, month: 9, year: 2026, file: pdf() }, slow);
  await new Promise((resolve) => setImmediate(resolve));
  await assert.rejects(() => sendMonthlyExpenseSummaryPdfForHub({ hubId, month: 9, year: 2026, file: pdf() }, slow), { statusCode: 409 });
  release(); await first;
  await sendMonthlyExpenseSummaryPdfForHub({ hubId, month: 10, year: 2026, file: pdf() }, dependencies(undefined, { uploadPdf: async () => "media-123", sendDocumentTemplate: async () => {} }));
  await assert.rejects(() => sendMonthlyExpenseSummaryPdfForHub({ hubId, month: 11, year: 2026, file: pdf() }, dependencies(undefined, { uploadPdf: async () => { throw new Error("failure"); }, sendDocumentTemplate: async () => {} })));
  await sendMonthlyExpenseSummaryPdfForHub({ hubId, month: 11, year: 2026, file: pdf() }, dependencies(undefined, { uploadPdf: async () => "media-123", sendDocumentTemplate: async () => {} }));
}));

test("persistent PDF run rejects a second completed send for the same month", async () => withTemplate("pdf_template", async () => {
  const prismaClient = fakePrisma(); const metaClient = { uploadPdf: async () => "media-123", sendDocumentTemplate: async () => ({}) };
  await sendMonthlyExpenseSummaryPdfForHub({ hubId, month: 9, year: 2026, file: pdf() }, { prismaClient, getMonthlySummary: async () => ({ totalCollected: 100, totalSpent: 40, balance: 60 }), metaClient });
  await assert.rejects(() => sendMonthlyExpenseSummaryPdfForHub({ hubId, month: 9, year: 2026, file: pdf() }, { prismaClient, getMonthlySummary: async () => ({}), metaClient }), { statusCode: 409 });
  assert.equal(prismaClient.__runs[0].state, "COMPLETED");
}));

test("failed PDF send marks the run retryable", async () => withTemplate("pdf_template", async () => {
  const prismaClient = fakePrisma(); const base = { prismaClient, getMonthlySummary: async () => ({ totalCollected: 100, totalSpent: 40, balance: 60 }) };
  const failed = await sendMonthlyExpenseSummaryPdfForHub({ hubId, month: 9, year: 2026, file: pdf() }, { ...base, metaClient: { uploadPdf: async () => "media-123", sendDocumentTemplate: async () => { throw new Error("rejected"); } } });
  assert.equal(failed.stopped, true); assert.equal(prismaClient.__runs[0].state, "FAILED_BEFORE_SEND");
  await sendMonthlyExpenseSummaryPdfForHub({ hubId, month: 9, year: 2026, file: pdf() }, { ...base, metaClient: { uploadPdf: async () => "media-123", sendDocumentTemplate: async () => ({}) } });
  assert.equal(prismaClient.__runs[0].state, "COMPLETED");
}));

test("disabled WhatsApp skips PDF delivery without creating or completing a run", async () => {
  const previous = process.env.ENABLE_WHATSAPP_NOTIFICATIONS; delete process.env.ENABLE_WHATSAPP_NOTIFICATIONS;
  const prismaClient = fakePrisma(); let uploadCalls = 0;
  try {
    const result = await sendMonthlyExpenseSummaryPdfForHub({ hubId, month: 9, year: 2026, file: pdf() }, { prismaClient, metaClient: { uploadPdf: async () => { uploadCalls += 1; }, sendDocumentTemplate: async () => { throw new Error("must not send"); } } });
    assert.deepEqual(result, { skipped: true, reason: "notifications-disabled" }); assert.equal(uploadCalls, 0); assert.equal(prismaClient.__runs.length, 0);
  } finally { if (previous === undefined) delete process.env.ENABLE_WHATSAPP_NOTIFICATIONS; else process.env.ENABLE_WHATSAPP_NOTIFICATIONS = previous; }
});

test("preview has no Meta activity and exposes only masked phones", async () => {
  const preview = await previewMonthlyExpensePdfRecipients({ hubId, month: 9, year: 2026 }, { prismaClient: fakePrisma(), getMonthlySummary: async () => ({ totalCollected: 100, totalSpent: 40, balance: 60 }) });
  assert.deepEqual(preview, { monthLabel: "September 2026", hubName: "Tirunelveli", messageValues: { month: "September 2026", income: "100", expenses: "40", balance: "60" }, recipientCount: 1, recipients: [{ name: "Asha", phone: "91XXXXXX9803" }] });
  assert.doesNotMatch(JSON.stringify(preview), /919999999803/);
});

test("PDF routes reject unauthenticated and member requests", async () => {
  const app = express(); app.use(express.json()); app.use("/api/expenses", expenseRoutes); app.use(errorHandler);
  process.env.JWT_SECRET = "test-secret";
  const server = await new Promise((resolve) => { const instance = app.listen(0, () => resolve(instance)); });
  const port = server.address().port;
  try {
    for (const path of ["/api/expenses/notify-pdf/preview", "/api/expenses/notify-pdf"]) {
      const unauthenticated = await fetch(`http://127.0.0.1:${port}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ hubId, month: 9, year: 2026 }) });
      assert.equal(unauthenticated.status, 401);
      const token = jwt.sign({ role: "MEMBER", userId: "member" }, process.env.JWT_SECRET);
      const memberResponse = await fetch(`http://127.0.0.1:${port}${path}`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ hubId, month: 9, year: 2026 }) });
      assert.equal(memberResponse.status, 403);
    }
  } finally { await new Promise((resolve) => server.close(resolve)); }
});

test("scheduled job skips document delivery without an admin-selected PDF", async () => {
  const previous = process.env.ENABLE_MONTHLY_EXPENSE_PDF_AUTOMATION; process.env.ENABLE_MONTHLY_EXPENSE_PDF_AUTOMATION = "true";
  const logs = []; const original = console.info; console.info = (...args) => logs.push(args.join(" "));
  try { assert.deepEqual(await runMonthlyExpenseNotificationJob(new Date(2026, 9, 1)), { skipped: true, reason: "admin-selected-pdf-required" }); assert.match(logs.join("\n"), /admin-selected PDF/); } finally { console.info = original; if (previous === undefined) delete process.env.ENABLE_MONTHLY_EXPENSE_PDF_AUTOMATION; else process.env.ENABLE_MONTHLY_EXPENSE_PDF_AUTOMATION = previous; }
});
