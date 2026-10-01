const DAY_MS = 24 * 60 * 60 * 1000;

export const runMonthlyExpenseNotificationJob = async (now = new Date()) => {
  if (process.env.ENABLE_MONTHLY_EXPENSE_PDF_AUTOMATION !== "true" || now.getDate() !== 1) return { skipped: true };
  console.info("[MONTHLY_EXPENSE_NOTIFICATION_JOB] Skipped: an admin-selected PDF is required; the scheduler will not send the document template or fall back to the legacy template.");
  return { skipped: true, reason: "admin-selected-pdf-required" };
};

export const scheduleMonthlyExpenseNotificationJob = () => {
  runMonthlyExpenseNotificationJob().catch((error) => console.error("[MONTHLY_EXPENSE_NOTIFICATION_JOB]", error));
  return setInterval(() => runMonthlyExpenseNotificationJob().catch((error) => console.error("[MONTHLY_EXPENSE_NOTIFICATION_JOB]", error)), DAY_MS);
};
