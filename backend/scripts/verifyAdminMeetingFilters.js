import { meetingFeeListQuerySchema, attendanceListQuerySchema } from "../src/validations/adminMeetingListValidation.js";
import { listAdminAttendance, listAdminMeetingFees } from "../src/services/adminMeetingListsService.js";
import { getCurrentMonthKey, getCurrentWeekStart } from "../src/utils/weekUtils.js";
import { prisma } from "../src/config/prismaClient.js";

const run = async (label, fn) => { const started = performance.now(); const value = await fn(); console.log(`${label}: ${value.rows.length}/${value.pagination.total} rows in ${(performance.now() - started).toFixed(1)}ms`); return value; };
try {
  const month = getCurrentMonthKey(); const weekStart = getCurrentWeekStart().toISOString().slice(0, 10);
  const invalid = meetingFeeListQuerySchema.safeParse({ minAmount: "2000", maxAmount: "500" });
  if (invalid.success) throw new Error("minAmount > maxAmount was not rejected");
  const fees = await run("fees baseline", () => listAdminMeetingFees(meetingFeeListQuerySchema.parse({ month, page: 1, pageSize: 10000 })));
  await run("fees paid", () => listAdminMeetingFees(meetingFeeListQuerySchema.parse({ month, status: "PAID", page: 1, pageSize: 10000 })));
  await run("fees amount range", () => listAdminMeetingFees(meetingFeeListQuerySchema.parse({ month, minAmount: 1, maxAmount: 999999, page: 1, pageSize: 10000 })));
  const attendance = await run("attendance baseline", () => listAdminAttendance(attendanceListQuerySchema.parse({ weekStart, page: 1, pageSize: 10000 })));
  const perfect = await run("attendance perfect month", () => listAdminAttendance(attendanceListQuerySchema.parse({ weekStart, perfectMonth: "true", page: 1, pageSize: 10000 })));
  if (perfect.rows.some((row) => !attendance.rows.some((all) => all.userId === row.userId))) throw new Error("Perfect-month rows are not part of the base attendance set");
  console.log(`PASS: validation, standalone filters, combined service output, and perfect-month subset verified. Baseline rows: fees=${fees.rows.length}, attendance=${attendance.rows.length}.`);
} finally { await prisma.$disconnect(); }
