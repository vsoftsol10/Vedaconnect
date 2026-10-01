import { prisma } from "../config/prismaClient.js";
import { sendWhatsAppMessage } from "../utils/whatsappNotify.js";
import { getMonthlySummary } from "./expenseService.js";
import { AppError } from "../middleware/errorHandler.js";

const TYPE = "MONTHLY_EXPENSE_SUMMARY";
const RUN_STATE = { IN_PROGRESS: "IN_PROGRESS", COMPLETED: "COMPLETED", FAILED_BEFORE_SEND: "FAILED_BEFORE_SEND" };
const STALE_RUN_MS = 15 * 60 * 1000;
const monthLabel = (month, year) => new Date(year, month - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
const amount = (value) => Number(value || 0).toString();
const periodFor = (month, year) => `${year}-${String(month).padStart(2, "0")}`;
const messageFor = (error) => error?.message?.slice(0, 1000) || "Unknown delivery error";

const acquireRun = async (prismaClient, hubId, period) => {
  while (true) {
    const existing = await prismaClient.monthlyExpenseSummaryRun.findUnique({ where: { hubId_period: { hubId, period } } });
    if (!existing) {
      try { return await prismaClient.monthlyExpenseSummaryRun.create({ data: { hubId, period, state: RUN_STATE.IN_PROGRESS } }); } catch (error) { if (error?.code === "P2002") continue; throw error; }
    }
    if (existing.state === RUN_STATE.COMPLETED) throw new AppError("A month-end summary has already been sent for this hub and month.", 409);
    if (existing.state === RUN_STATE.FAILED_BEFORE_SEND) {
      const claim = await prismaClient.monthlyExpenseSummaryRun.updateMany({ where: { id: existing.id, state: RUN_STATE.FAILED_BEFORE_SEND }, data: { state: RUN_STATE.IN_PROGRESS, startedAt: new Date(), failedBeforeSendAt: null, errorMessage: null } });
      if (claim.count) return prismaClient.monthlyExpenseSummaryRun.findUnique({ where: { id: existing.id } });
      continue;
    }
    const staleBefore = new Date(Date.now() - STALE_RUN_MS);
    if (existing.state === RUN_STATE.IN_PROGRESS && existing.startedAt <= staleBefore) {
      const acceptedAttemptCount = await prismaClient.notificationLog.count({ where: { runId: existing.id, status: "accepted" } });
      if (acceptedAttemptCount) {
        await prismaClient.monthlyExpenseSummaryRun.updateMany({ where: { id: existing.id, state: RUN_STATE.IN_PROGRESS, startedAt: { lte: staleBefore } }, data: { state: RUN_STATE.COMPLETED, completedAt: new Date(), errorMessage: "Recovered stale run with recorded message attempts; replay blocked to prevent duplicate messages." } });
        throw new AppError("A stale month-end summary run already has message attempts, so replay is blocked to prevent duplicates.", 409);
      }
      const claim = await prismaClient.monthlyExpenseSummaryRun.updateMany({ where: { id: existing.id, state: RUN_STATE.IN_PROGRESS, startedAt: { lte: staleBefore } }, data: { startedAt: new Date(), errorMessage: null } });
      if (claim.count) return prismaClient.monthlyExpenseSummaryRun.findUnique({ where: { id: existing.id } });
      continue;
    }
    throw new AppError("A month-end summary is already being sent for this hub and month.", 409);
  }
};

const finishRun = async (prismaClient, runId, state, errorMessage = null) => prismaClient.monthlyExpenseSummaryRun.update({ where: { id: runId }, data: { state, completedAt: state === RUN_STATE.COMPLETED ? new Date() : null, failedBeforeSendAt: state === RUN_STATE.FAILED_BEFORE_SEND ? new Date() : null, errorMessage } });

export const sendMonthlyExpenseSummaryForHub = async (hubId, month, year, dependencies = {}) => {
  const prismaClient = dependencies.prismaClient || prisma;
  const getSummary = dependencies.getSummary || getMonthlySummary;
  const sendMessage = dependencies.sendMessage || sendWhatsAppMessage;
  const period = periodFor(month, year);
  const run = await acquireRun(prismaClient, hubId, period);
  let acceptedCount = 0; let failureCount = 0;
  try {
    const [summary, members] = await Promise.all([
      getSummary(hubId, month, year),
      prismaClient.user.findMany({ where: { status: "ACTIVE", role: "MEMBER", memberProfile: { hubId, phone: { not: null } } }, include: { memberProfile: { select: { phone: true } } } }),
    ]);
    const template = process.env.WHATSAPP_EXPENSE_SUMMARY_TEMPLATE;
    const baseUrl = process.env.MEMBER_APP_BASE_URL?.replace(/\/$/, "");
    if (!template || !baseUrl) throw new Error("WhatsApp expense summary template or member app URL is not configured.");
    const variables = [monthLabel(month, year), amount(summary.totalCollected), amount(summary.totalSpent), amount(summary.balance), `${baseUrl}/expenses/summary?month=${month}&year=${year}`];
    for (const member of members) {
      const phone = member.memberProfile?.phone?.trim();
      if (!phone) continue;
      try {
        const metaResponse = await sendMessage(phone, template, variables);
        acceptedCount += 1;
        await prismaClient.notificationLog.create({ data: { runId: run.id, memberId: member.id, hubId, type: TYPE, period, status: "accepted", metaMessageId: metaResponse?.messages?.[0]?.id || null, acceptedAt: new Date() } });
      } catch (error) {
        console.error("[MONTHLY_EXPENSE_WHATSAPP_FAILED]", { hubId, memberId: member.id, message: error?.message });
        await prismaClient.notificationLog.create({ data: { runId: run.id, memberId: member.id, hubId, type: TYPE, period, status: "api_failed", errorMessage: messageFor(error) } });
        failureCount += 1;
      }
    }
    const state = acceptedCount ? RUN_STATE.COMPLETED : RUN_STATE.FAILED_BEFORE_SEND;
    await finishRun(prismaClient, run.id, state, acceptedCount ? null : "No month-end summary message was accepted by Meta.");
    return { successCount: acceptedCount, failureCount, runState: state };
  } catch (error) {
    await finishRun(prismaClient, run.id, acceptedCount ? RUN_STATE.COMPLETED : RUN_STATE.FAILED_BEFORE_SEND, messageFor(error));
    throw error;
  }
};

export const getMonthlyExpenseNotificationLogs = async ({ hubId, month, year }) => prisma.notificationLog.findMany({
  where: { hubId, type: TYPE, period: periodFor(month, year) },
  include: { member: { include: { memberProfile: { select: { fullName: true, phone: true } } } } },
  orderBy: { sentAt: "desc" },
});
