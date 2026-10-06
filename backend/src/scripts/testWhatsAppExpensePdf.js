import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "../config/prismaClient.js";
import { sendWhatsAppDocumentTemplate, uploadWhatsAppPdf } from "../utils/whatsappNotify.js";
import { normalizeWhatsAppPhone } from "../utils/whatsappNotify.js";

const pdfPath = process.argv[2];
const testPhone = process.env.WHATSAPP_PDF_TEST_PHONE?.trim();

if (process.argv.length !== 3) throw new Error("Usage: npm run test:whatsapp-pdf -- <path-to-pdf>");
if (!testPhone) throw new Error("WHATSAPP_PDF_TEST_PHONE is required. This command only sends to that one configured number.");
if (process.env.ENABLE_WHATSAPP_NOTIFICATIONS !== "true") throw new Error("ENABLE_WHATSAPP_NOTIFICATIONS must be true before the one-member test can run.");
const templateName = process.env.WHATSAPP_EXPENSE_SUMMARY_PDF_TEMPLATE?.trim();
if (!templateName) throw new Error("WHATSAPP_EXPENSE_SUMMARY_PDF_TEMPLATE is required.");

// Resolve exactly one configured recipient before making any Meta call, so its
// wamid can be correlated with the status webhook in notification_logs.
const recipient = await prisma.user.findFirst({
  where: { memberProfile: { phone: { in: [testPhone, normalizeWhatsAppPhone(testPhone), `+${normalizeWhatsAppPhone(testPhone)}`] } } },
  select: { id: true, memberProfile: { select: { hubId: true } } },
});
if (!recipient?.memberProfile?.hubId) throw new Error("WHATSAPP_PDF_TEST_PHONE must belong to one existing member with a hub before this test can run.");

const buffer = await fs.readFile(pdfPath);
if (!buffer.subarray(0, 5).equals(Buffer.from("%PDF-"))) throw new Error("The supplied file is not a PDF.");
const filename = `TEST-WhatsApp-Delivery-Check-${path.basename(pdfPath).replace(/[^a-zA-Z0-9._-]/g, "-")}`;
const mediaId = await uploadWhatsAppPdf({ buffer, filename });
const result = await sendWhatsAppDocumentTemplate({
  phone: testPhone,
  templateName,
  mediaId,
  filename,
  variables: ["TEST PDF — delivery webhook check", "0", "0", "0"],
});
const metaMessageId = result?.messages?.[0]?.id || null;
if (!metaMessageId) throw new Error("Meta accepted the request without a message ID; no test log was created.");
const now = new Date();
await prisma.notificationLog.create({ data: {
  memberId: recipient.id,
  hubId: recipient.memberProfile.hubId,
  type: "WHATSAPP_PDF_WEBHOOK_TEST",
  period: now.toISOString().slice(0, 7),
  status: "accepted",
  metaMessageId,
  acceptedAt: now,
} });
console.log("[WHATSAPP_PDF_TEST_ACCEPTED] Meta accepted one clearly labelled test PDF; its wamid was logged for webhook tracking.", { metaMessageId });
