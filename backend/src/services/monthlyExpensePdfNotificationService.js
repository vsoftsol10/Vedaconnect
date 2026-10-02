import { prisma } from "../config/prismaClient.js";
import { AppError } from "../middleware/errorHandler.js";
import { sanitizeProviderErrorText } from "../utils/sanitizeProviderError.js";
import { sendWhatsAppDocumentTemplate, uploadWhatsAppPdf } from "../utils/whatsappNotify.js";
import { getMonthlySummary } from "./expenseService.js";

const TYPE = "MONTHLY_EXPENSE_SUMMARY";
const MAX_PDF_BYTES = 5 * 1024 * 1024;
const activeSends = new Set();
const periodFor = (month, year) => `${year}-${String(month).padStart(2, "0")}`;
const monthLabel = (month, year) => new Date(year, month - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
// This intentionally matches the existing month-end flow's unformatted numeric strings.
const amount = (value) => Number(value || 0).toString();
const safeSegment = (value) => String(value || "Hub").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").slice(0, 60) || "Hub";

export const maskPhone = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits ? `${digits.slice(0, 2)}XXXXXX${digits.slice(-4)}` : "missing";
};

export const pdfFilenameFor = (hubName, month, year) => `Vedaconnect-${safeSegment(hubName)}-Accounts-${monthLabel(month, year).replace(/\s/g, "-")}.pdf`;

export const validateAccountsPdf = (file) => {
  if (!file?.buffer?.length) throw new AppError("Choose a non-empty PDF file.", 400);
  if (file.mimetype !== "application/pdf") throw new AppError("Accounts file must be a PDF.", 400);
  if (file.buffer.length > MAX_PDF_BYTES || Number(file.size) > MAX_PDF_BYTES) throw new AppError("Accounts PDF must be 5 MB or smaller.", 400);
  if (!file.buffer.subarray(0, 5).equals(Buffer.from("%PDF-"))) throw new AppError("Accounts file is not a valid PDF.", 400);
};

const recipientsFor = async (prismaClient, hubId) => {
  const members = await prismaClient.user.findMany({
    where: { status: "ACTIVE", role: "MEMBER", memberProfile: { hubId, phone: { not: null } } },
    include: { memberProfile: { select: { fullName: true, phone: true } } },
  });
  return members.filter((member) => member.memberProfile?.phone?.trim());
};

const configuredTemplate = () => {
  const template = process.env.WHATSAPP_EXPENSE_SUMMARY_PDF_TEMPLATE?.trim();
  if (!template) throw new AppError("PDF month-end WhatsApp template is not configured.", 500);
  return template;
};

const loadHub = async (prismaClient, hubId) => {
  const hub = await prismaClient.hub.findUnique({ where: { id: hubId }, select: { name: true } });
  if (!hub) throw new AppError("Hub not found.", 404);
  return hub;
};

export const previewMonthlyExpensePdfRecipients = async ({ hubId, month, year }, dependencies = {}) => {
  const prismaClient = dependencies.prismaClient || prisma;
  const getSummary = dependencies.getMonthlySummary || getMonthlySummary;
  const hub = await loadHub(prismaClient, hubId);
  const [recipients, summary] = await Promise.all([recipientsFor(prismaClient, hubId), getSummary(hubId, month, year)]);
  return {
    monthLabel: monthLabel(month, year),
    hubName: hub.name,
    messageValues: { month: monthLabel(month, year), income: amount(summary.totalCollected), expenses: amount(summary.totalSpent), balance: amount(summary.balance) },
    recipientCount: recipients.length,
    recipients: recipients.map((member) => ({ name: member.memberProfile.fullName || "Member", phone: maskPhone(member.memberProfile.phone) })),
  };
};

export const sendMonthlyExpenseSummaryPdfForHub = async ({ hubId, month, year, file }, dependencies = {}) => {
  const template = configuredTemplate(); // Must happen before any upload or Meta message.
  validateAccountsPdf(file);
  const key = `${hubId}:${periodFor(month, year)}`;
  if (activeSends.has(key)) throw new AppError("A PDF month-end send is already running for this hub and period.", 409);
  activeSends.add(key);

  const prismaClient = dependencies.prismaClient || prisma;
  const getSummary = dependencies.getMonthlySummary || getMonthlySummary;
  const metaClient = dependencies.metaClient || { uploadPdf: uploadWhatsAppPdf, sendDocumentTemplate: sendWhatsAppDocumentTemplate };
  try {
    const hub = await loadHub(prismaClient, hubId);
    const [recipients, summary] = await Promise.all([recipientsFor(prismaClient, hubId), getSummary(hubId, month, year)]);
    const filename = pdfFilenameFor(hub.name, month, year);
    const mediaId = await metaClient.uploadPdf({ buffer: file.buffer, filename });
    const variables = [monthLabel(month, year), amount(summary.totalCollected), amount(summary.totalSpent), amount(summary.balance)];
    let successCount = 0;
    for (const member of recipients) {
      try {
        await metaClient.sendDocumentTemplate({ phone: member.memberProfile.phone, templateName: template, mediaId, filename, variables });
        await prismaClient.notificationLog.create({ data: { memberId: member.id, hubId, type: TYPE, period: periodFor(month, year), status: "success" } });
        successCount += 1;
      } catch (error) {
        const providerError = sanitizeProviderErrorText(error?.message);
        await prismaClient.notificationLog.create({ data: { memberId: member.id, hubId, type: TYPE, period: periodFor(month, year), status: "failed", errorMessage: providerError } });
        console.error("[MONTHLY_EXPENSE_PDF_SEND_FAILED]", { hubId, memberId: member.id, phone: maskPhone(member.memberProfile.phone), message: providerError });
        return { successCount, failureCount: 1, stopped: true, remainingRecipients: recipients.slice(successCount).map((recipient) => ({ name: recipient.memberProfile.fullName || "Member", phone: maskPhone(recipient.memberProfile.phone) })), message: "Meta rejected a message; sending stopped without retrying." };
      }
    }
    return { successCount, failureCount: 0, stopped: false };
  } finally {
    activeSends.delete(key);
  }
};

// Test-only seam to make lock state deterministic between tests.
export const __resetMonthlyExpensePdfSendLockForTests = () => activeSends.clear();
