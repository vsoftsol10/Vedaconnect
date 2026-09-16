import { prisma } from "../config/prismaClient.js";
import { sendMonthlyExpenseSummaryForHub } from "../services/monthlyExpenseNotificationService.js";

const DAY_MS = 24 * 60 * 60 * 1000;

export const runMonthlyExpenseNotificationJob = async (now = new Date()) => {
  if (process.env.ENABLE_MONTHLY_EXPENSE_NOTIFICATION !== "true" || now.getDate() !== 1) return { skipped: true };
  const previous = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const hubs = await prisma.hub.findMany({ where: { isActive: true }, select: { id: true } });
  const results = await Promise.allSettled(hubs.map((hub) => sendMonthlyExpenseSummaryForHub(hub.id, previous.getMonth() + 1, previous.getFullYear())));
  return { skipped: false, hubs: results.length };
};

export const scheduleMonthlyExpenseNotificationJob = () => {
  runMonthlyExpenseNotificationJob().catch((error) => console.error("[MONTHLY_EXPENSE_NOTIFICATION_JOB]", error));
  return setInterval(() => runMonthlyExpenseNotificationJob().catch((error) => console.error("[MONTHLY_EXPENSE_NOTIFICATION_JOB]", error)), DAY_MS);
};
