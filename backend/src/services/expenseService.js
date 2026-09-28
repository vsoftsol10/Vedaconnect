import crypto from "crypto";
import { prisma } from "../config/prismaClient.js";
import { supabaseStorage } from "../config/supabaseStorageClient.js";
import { AppError } from "../middleware/errorHandler.js";

const RECEIPTS_BUCKET = "expense-receipts";
const MANUAL_FEE_RECEIPTS_BUCKET = "manual-fee-receipts";
const dateRange = (month, year) => ({
  gte: new Date(year, month - 1, 1),
  lt: new Date(year, month, 1),
});

const serializeExpense = (expense) => ({ ...expense, amount: Number(expense.amount) });
const serializeManualFee = (payment) => ({
  id: payment.id,
  memberId: payment.userId,
  memberName: payment.user?.memberProfile?.fullName || payment.user?.email || "Member",
  businessName: payment.user?.memberProfile?.businessName || "",
  date: payment.paidAt,
  meetingWeek: payment.meetingWeek,
  month: payment.month,
  amount: Number(payment.amount),
  paymentMode: payment.paymentMode,
  note: payment.note || "",
  hasReceipt: Boolean(payment.receiptPath),
  recordedAt: payment.recordedAt,
});
const istDate = (value) => new Date(`${value}T00:00:00+05:30`);
const removeManualReceipt = async (path) => {
  if (!path) return;
  const { error } = await supabaseStorage.storage.from(MANUAL_FEE_RECEIPTS_BUCKET).remove([path]);
  if (error && !/not found/i.test(error.message || "")) console.error("[MANUAL_FEE_RECEIPT_DELETE_FAILED]", { path, message: error.message });
};
const uploadManualReceipt = async (file, hubId, memberId) => {
  if (!file) return null;
  const name = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  const path = `${hubId}/${memberId}/${crypto.randomUUID()}-${name}`;
  const { error } = await supabaseStorage.storage.from(MANUAL_FEE_RECEIPTS_BUCKET).upload(path, file.buffer, { contentType: file.mimetype, upsert: false });
  if (error) throw new AppError(`Could not upload receipt: ${error.message}`, 502);
  return path;
};
const canonicalCategory = async (category) => {
  const existing = await prisma.expense.findFirst({ where: { category: { equals: category, mode: "insensitive" } }, select: { category: true }, orderBy: { createdAt: "asc" } });
  return existing?.category || category;
};

const uploadReceipt = async (file, hubId) => {
  if (!file) return null;
  const path = `${hubId}/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const { error } = await supabaseStorage.storage.from(RECEIPTS_BUCKET).upload(path, file.buffer, { contentType: file.mimetype, upsert: false });
  if (error) throw new AppError(`Could not upload receipt: ${error.message}`, 502);
  const { data } = supabaseStorage.storage.from(RECEIPTS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
};

export const createExpense = async (data, createdBy, receiptFile) => {
  const receiptUrl = (await uploadReceipt(receiptFile, data.hubId)) || data.receiptUrl || null;
  return serializeExpense(await prisma.expense.create({ data: { ...data, category: await canonicalCategory(data.category), date: new Date(data.date), receiptUrl, createdBy } }));
};

export const getExpenses = async ({ hubId, month, year } = {}) => {
  const where = {};
  if (hubId) where.hubId = hubId;
  if (month && year) where.date = dateRange(month, year);
  const expenses = await prisma.expense.findMany({ where, include: { hub: { select: { name: true } }, creator: { select: { fullName: true, email: true } } }, orderBy: [{ date: "desc" }, { createdAt: "desc" }] });
  return expenses.map(serializeExpense);
};

export const updateExpense = async (id, data, receiptFile) => {
  const current = await prisma.expense.findUnique({ where: { id } });
  if (!current) throw new AppError("Expense not found.", 404);
  const receiptUrl = (await uploadReceipt(receiptFile, data.hubId)) || data.receiptUrl || current.receiptUrl;
  return serializeExpense(await prisma.expense.update({ where: { id }, data: { ...data, category: await canonicalCategory(data.category), date: new Date(data.date), receiptUrl } }));
};

export const getExpenseCategories = async (q = "") => {
  const values = await prisma.expense.findMany({ where: q ? { category: { contains: q.trim(), mode: "insensitive" } } : undefined, select: { category: true } });
  const grouped = new Map();
  values.forEach(({ category }) => { const key = category.toLocaleLowerCase(); const current = grouped.get(key) || { category, count: 0 }; current.count += 1; grouped.set(key, current); });
  return [...grouped.values()].sort((a, b) => b.count - a.count || a.category.localeCompare(b.category)).slice(0, 50);
};

export const deleteExpense = async (id) => {
  const current = await prisma.expense.findUnique({ where: { id } });
  if (!current) throw new AppError("Expense not found.", 404);
  await prisma.expense.delete({ where: { id } });
  return { id };
};

export const getMonthlySummary = async (hubId, month, year) => {
  if (!hubId) throw new AppError("Hub is required.", 400);
  const [expenses, payments] = await Promise.all([
    prisma.expense.findMany({ where: { hubId, date: dateRange(month, year) }, select: { category: true, amount: true } }),
    prisma.meetingFeePayment.findMany({
      where: { month: `${year}-${String(month).padStart(2, "0")}`, paymentStatus: "PAID", user: { memberProfile: { hubId } } },
      select: { amount: true, paymentSource: true },
    }),
  ]);
  const categoryBreakdown = expenses.reduce((result, expense) => {
    const existing = Object.keys(result).find((key) => key.toLocaleLowerCase() === expense.category.toLocaleLowerCase()) || expense.category;
    result[existing] = (result[existing] || 0) + Number(expense.amount);
    return result;
  }, {});
  const paise = (value) => Math.round(Number(value) * 100);
  const fromPaise = (value) => Number((value / 100).toFixed(2));
  const onlineCollected = fromPaise(payments.filter((payment) => payment.paymentSource !== "MANUAL").reduce((total, payment) => total + paise(payment.amount), 0));
  const manualCollected = fromPaise(payments.filter((payment) => payment.paymentSource === "MANUAL").reduce((total, payment) => total + paise(payment.amount), 0));
  const totalCollected = fromPaise(Math.round((onlineCollected + manualCollected) * 100));
  const totalSpent = fromPaise(expenses.reduce((total, expense) => total + paise(expense.amount), 0));
  return { hubId, month, year, totalCollected, onlineCollected, manualCollected, totalSpent, balance: fromPaise(Math.round((totalCollected - totalSpent) * 100)), categoryBreakdown };
};

const assertMemberHub = async (memberId, hubId) => {
  const member = await prisma.user.findFirst({ where: { id: memberId, role: "MEMBER", status: { not: "DELETED" }, memberProfile: { is: { hubId } } }, include: { memberProfile: true } });
  if (!member) throw new AppError("The selected member does not belong to this hub.", 400);
  return member;
};

const manualFeeInclude = { user: { include: { memberProfile: true } } };

export const getManualFeeCollections = async ({ hubId, month, page = 1, pageSize = 10 }) => {
  const where = { month, paymentStatus: "PAID", paymentSource: "MANUAL", user: { memberProfile: { hubId } } };
  const [records, total] = await Promise.all([
    prisma.meetingFeePayment.findMany({ where, include: manualFeeInclude, orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }], skip: (page - 1) * pageSize, take: pageSize }),
    prisma.meetingFeePayment.count({ where }),
  ]);
  return { rows: records.map(serializeManualFee), pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
};

export const createManualFeeCollection = async (data, adminId, receiptFile) => {
  const date = istDate(data.date);
  const month = data.date.slice(0, 7);
  await assertMemberHub(data.memberId, data.hubId);
  const uploadedPath = await uploadManualReceipt(receiptFile, data.hubId, data.memberId);
  try {
    const payment = await prisma.$transaction(async (tx) => {
      const existing = await tx.meetingFeePayment.findUnique({ where: { userId_month: { userId: data.memberId, month } } });
      if (existing?.paymentStatus === "PAID") throw new AppError("This member's meeting fee is already paid for this month.", 409);
      const values = { amount: data.amount, paymentStatus: "PAID", paymentSource: "MANUAL", paymentMode: data.paymentMode, note: data.note || null, receiptPath: uploadedPath, recordedBy: adminId, recordedAt: new Date(), meetingWeek: istDate(data.meetingWeek), paidAt: date, razorpayOrderId: null, razorpayPaymentId: null, razorpaySignature: null };
      return tx.meetingFeePayment.upsert({ where: { userId_month: { userId: data.memberId, month } }, update: values, create: { userId: data.memberId, month, ...values }, include: manualFeeInclude });
    });
    return serializeManualFee(payment);
  } catch (error) {
    await removeManualReceipt(uploadedPath);
    throw error;
  }
};

export const updateManualFeeCollection = async (id, data, adminId, receiptFile) => {
  const current = await prisma.meetingFeePayment.findUnique({ where: { id } });
  if (!current || current.paymentSource !== "MANUAL") throw new AppError("Manual fee collection not found.", 404);
  const date = istDate(data.date); const month = data.date.slice(0, 7);
  await assertMemberHub(data.memberId, data.hubId);
  if (current.userId !== data.memberId) throw new AppError("A manual collection cannot be moved to another member.", 400);
  const uploadedPath = await uploadManualReceipt(receiptFile, data.hubId, data.memberId);
  try {
    const payment = await prisma.$transaction(async (tx) => {
      if (month !== current.month) {
        const other = await tx.meetingFeePayment.findUnique({ where: { userId_month: { userId: data.memberId, month } } });
        if (other?.paymentStatus === "PAID") throw new AppError("This member's meeting fee is already paid for this month.", 409);
      }
      return tx.meetingFeePayment.update({ where: { id }, data: { month, amount: data.amount, paymentMode: data.paymentMode, note: data.note || null, receiptPath: uploadedPath || current.receiptPath, recordedBy: adminId, recordedAt: new Date(), meetingWeek: istDate(data.meetingWeek), paidAt: date }, include: manualFeeInclude });
    });
    if (uploadedPath && current.receiptPath) await removeManualReceipt(current.receiptPath);
    return serializeManualFee(payment);
  } catch (error) {
    await removeManualReceipt(uploadedPath);
    throw error;
  }
};

export const deleteManualFeeCollection = async (id) => {
  const current = await prisma.meetingFeePayment.findUnique({ where: { id } });
  if (!current || current.paymentSource !== "MANUAL") throw new AppError("Manual fee collection not found.", 404);
  await removeManualReceipt(current.receiptPath);
  await prisma.$transaction((tx) => tx.meetingFeePayment.update({ where: { id }, data: { paymentStatus: "PENDING", paymentSource: "ONLINE", paymentMode: null, note: null, receiptPath: null, recordedBy: null, recordedAt: null, meetingWeek: null, paidAt: null } }));
  return { id };
};

export const getManualFeeReceiptUrl = async (id) => {
  const current = await prisma.meetingFeePayment.findFirst({ where: { id, paymentSource: "MANUAL", paymentStatus: "PAID" }, select: { receiptPath: true } });
  if (!current?.receiptPath) throw new AppError("Receipt not found.", 404);
  const { data, error } = await supabaseStorage.storage.from(MANUAL_FEE_RECEIPTS_BUCKET).createSignedUrl(current.receiptPath, 300);
  if (error) throw new AppError(`Could not open receipt: ${error.message}`, 502);
  return { url: data.signedUrl, expiresIn: 300 };
};

export const getMemberHubId = async (userId) => {
  const profile = await prisma.memberProfile.findUnique({ where: { userId }, select: { hubId: true } });
  if (!profile?.hubId) throw new AppError("No hub is assigned to this member.", 404);
  return profile.hubId;
};
