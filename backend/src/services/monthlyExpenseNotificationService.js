import { prisma } from "../config/prismaClient.js";
import { sendWhatsAppMessage } from "../utils/whatsappNotify.js";
import { getMonthlySummary } from "./expenseService.js";

const TYPE = "MONTHLY_EXPENSE_SUMMARY";
const monthLabel = (month, year) => new Date(year, month - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
const amount = (value) => Number(value || 0).toString();

export const sendMonthlyExpenseSummaryForHub = async (hubId, month, year) => {
  const [summary, members] = await Promise.all([
    getMonthlySummary(hubId, month, year),
    prisma.user.findMany({ where: { status: "ACTIVE", role: "MEMBER", memberProfile: { hubId, phone: { not: null } } }, include: { memberProfile: { select: { phone: true } } } }),
  ]);
  const template = process.env.WHATSAPP_EXPENSE_SUMMARY_TEMPLATE;
  const baseUrl = process.env.MEMBER_APP_BASE_URL?.replace(/\/$/, "");
  if (!template || !baseUrl) throw new Error("WhatsApp expense summary template or member app URL is not configured.");
  const variables = [monthLabel(month, year), amount(summary.totalCollected), amount(summary.totalSpent), amount(summary.balance), `${baseUrl}/expenses/summary?month=${month}&year=${year}`];
  const period = `${year}-${String(month).padStart(2, "0")}`;
  let successCount = 0; let failureCount = 0;
  for (const member of members) {
    const phone = member.memberProfile?.phone?.trim();
    if (!phone) continue;
    try {
      await sendWhatsAppMessage(phone, template, variables);
      await prisma.notificationLog.create({ data: { memberId: member.id, hubId, type: TYPE, period, status: "success" } });
      successCount += 1;
    } catch (error) {
      console.error("[MONTHLY_EXPENSE_WHATSAPP_FAILED]", { hubId, memberId: member.id, message: error?.message });
      await prisma.notificationLog.create({ data: { memberId: member.id, hubId, type: TYPE, period, status: "failed", errorMessage: error?.message?.slice(0, 1000) || "Unknown delivery error" } });
      failureCount += 1;
    }
  }
  return { successCount, failureCount };
};

export const getMonthlyExpenseNotificationLogs = async ({ hubId, month, year }) => prisma.notificationLog.findMany({
  where: { hubId, type: TYPE, period: `${year}-${String(month).padStart(2, "0")}` },
  include: { member: { include: { memberProfile: { select: { fullName: true, phone: true } } } } },
  orderBy: { sentAt: "desc" },
});
