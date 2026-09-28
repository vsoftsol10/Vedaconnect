import { prisma } from "../config/prismaClient.js";
import { AppError } from "../middleware/errorHandler.js";
import { getCurrentMonthKey, getMonthRange } from "../utils/weekUtils.js";

const FEE = 1800;
const pageResult = (rows, page, pageSize) => ({ rows: rows.slice((page - 1) * pageSize, page * pageSize), pagination: { page, pageSize, total: rows.length, totalPages: Math.max(1, Math.ceil(rows.length / pageSize)) } });
const istDate = (value, end = false) => new Date(`${value}T${end ? "23:59:59.999" : "00:00:00.000"}+05:30`);
const memberWhere = (query) => ({ role: "MEMBER", status: { not: "DELETED" }, memberProfile: { is: { ...(query.hub ? { hubId: query.hub } : {}), ...(query.search ? { OR: [{ fullName: { contains: query.search, mode: "insensitive" } }, { businessName: { contains: query.search, mode: "insensitive" } }] } : {}) } } });

export const listAdminMeetingFees = async (query) => {
  const month = query.month || getCurrentMonthKey();
  const members = await prisma.user.findMany({ where: memberWhere(query), include: { memberProfile: { include: { hub: true } }, meetingFeePayments: { where: { month } } }, orderBy: { createdAt: "asc" } });
  const allMembers = await prisma.user.findMany({ where: { role: "MEMBER", status: { not: "DELETED" }, memberProfile: { isNot: null } }, include: { meetingFeePayments: { where: { month } } } });
  let rows = members.map((member) => { const payment = member.meetingFeePayments[0]; return { userId: member.id, fullName: member.memberProfile.fullName || member.email, businessName: member.memberProfile.businessName || "", hub: member.memberProfile.hub?.name || "Not assigned", hubId: member.memberProfile.hubId, month, amount: Number(payment?.amount || FEE), paymentStatus: payment?.paymentStatus === "PAID" ? "PAID" : "PENDING", paymentSource: payment?.paymentSource || "ONLINE", paidAt: payment?.paidAt || null }; });
  rows = rows.filter((row) => (!query.status || row.paymentStatus === query.status) && (!query.source || (row.paymentStatus === "PAID" && row.paymentSource === query.source)) && (query.minAmount == null || row.amount >= query.minAmount) && (query.maxAmount == null || row.amount <= query.maxAmount) && (!query.paidFrom || (row.paidAt && row.paidAt >= istDate(query.paidFrom))) && (!query.paidTo || (row.paidAt && row.paidAt <= istDate(query.paidTo, true))));
  rows.sort((a, b) => query.sort === "name" ? a.fullName.localeCompare(b.fullName) : query.sort === "amount" ? b.amount - a.amount : Number(b.paidAt || 0) - Number(a.paidAt || 0));
  const filteredTotals = { count: rows.length, collected: rows.filter((r) => r.paymentStatus === "PAID").reduce((sum, r) => sum + r.amount, 0), pendingAmount: rows.filter((r) => r.paymentStatus !== "PAID").reduce((sum, r) => sum + r.amount, 0) };
  const summary = { count: allMembers.length, collected: allMembers.reduce((sum, member) => sum + Number(member.meetingFeePayments[0]?.paymentStatus === "PAID" ? member.meetingFeePayments[0].amount : 0), 0), pendingAmount: allMembers.reduce((sum, member) => sum + (member.meetingFeePayments[0]?.paymentStatus === "PAID" ? 0 : FEE), 0) };
  return { month, ...pageResult(rows, query.page, query.pageSize), summary, filteredTotals };
};

export const getAdminMemberMeetingFees = async (userId, query) => {
  const member = await prisma.user.findFirst({ where: { id: userId, role: "MEMBER" }, select: { id: true } });
  if (!member) throw new AppError("Member not found.", 404);
  const [membership, payments] = await Promise.all([prisma.membership.findUnique({ where: { userId }, select: { joinedAt: true, createdAt: true } }), prisma.meetingFeePayment.findMany({ where: { userId }, orderBy: { month: "desc" } })]);
  const byMonth = new Map(payments.map((item) => [item.month, item])); const start = membership?.joinedAt || membership?.createdAt || new Date(); const cursor = new Date(start.getFullYear(), start.getMonth(), 1); const now = new Date(); const rows = [];
  while (cursor <= now) { const month = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`; const payment = byMonth.get(month); rows.unshift({ month, amount: Number(payment?.amount || FEE), paymentStatus: payment?.paymentStatus || "PENDING", paymentSource: payment?.paymentSource || "ONLINE", paidAt: payment?.paidAt || null }); cursor.setMonth(cursor.getMonth() + 1); }
  return pageResult(rows, query.page, query.pageSize);
};

export const getPerfectAttendanceMemberIds = async (monthKey) => {
  const { start, end } = getMonthRange(monthKey);
  const rows = await prisma.meetingAttendance.findMany({ where: { weekStart: { gte: start, lt: end } }, select: { userId: true, weekStart: true, status: true } });
  const weeks = [...new Set(rows.map((row) => row.weekStart.toISOString().slice(0, 10)))];
  if (!weeks.length) return new Set();
  const byUser = new Map(); rows.forEach((row) => { const values = byUser.get(row.userId) || []; values.push(row); byUser.set(row.userId, values); });
  return new Set([...byUser].filter(([, values]) => values.length === weeks.length && values.every((row) => row.status === "CONFIRMED")).map(([userId]) => userId));
};

export const listAdminAttendance = async (query) => {
  const weekStart = new Date(query.weekStart); const month = weekStart.toISOString().slice(0, 7); const perfectIds = query.perfectMonth ? await getPerfectAttendanceMemberIds(month) : null;
  const members = await prisma.user.findMany({ where: memberWhere(query), include: { memberProfile: { include: { hub: true } }, meetingAttendance: { where: { weekStart } } }, orderBy: { createdAt: "asc" } });
  let rows = members.map((member) => { const attendance = member.meetingAttendance[0]; return { userId: member.id, fullName: member.memberProfile.fullName || member.email, businessName: member.memberProfile.businessName || "", hub: member.memberProfile.hub?.name || "Not assigned", hubId: member.memberProfile.hubId, weekStart, status: attendance?.status === "DECLINED" ? "ABSENT" : attendance?.status || "PENDING", respondedAt: attendance?.respondedAt || null }; });
  rows = rows.filter((row) => (!query.statuses.length || query.statuses.includes(row.status)) && (!query.responded || (query.responded === "yes" ? !!row.respondedAt : !row.respondedAt)) && (!query.confirmedFromTime || (row.respondedAt && row.status === "CONFIRMED" && row.respondedAt.toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false }) >= query.confirmedFromTime)) && (!query.confirmedToTime || (row.respondedAt && row.status === "CONFIRMED" && row.respondedAt.toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false }) <= query.confirmedToTime)) && (!perfectIds || perfectIds.has(row.userId)));
  return { weekStart, ...pageResult(rows, query.page, query.pageSize), filteredCount: rows.length };
};
