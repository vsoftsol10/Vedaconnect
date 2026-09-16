import { prisma } from "../config/prismaClient.js";
import { supabaseStorage } from "../config/supabaseStorageClient.js";
import { AppError } from "../middleware/errorHandler.js";

const RECEIPTS_BUCKET = "expense-receipts";
const dateRange = (month, year) => ({
  gte: new Date(year, month - 1, 1),
  lt: new Date(year, month, 1),
});

const serializeExpense = (expense) => ({ ...expense, amount: Number(expense.amount) });

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
  return serializeExpense(await prisma.expense.create({ data: { ...data, date: new Date(data.date), receiptUrl, createdBy } }));
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
  return serializeExpense(await prisma.expense.update({ where: { id }, data: { ...data, date: new Date(data.date), receiptUrl } }));
};

export const deleteExpense = async (id) => {
  const current = await prisma.expense.findUnique({ where: { id } });
  if (!current) throw new AppError("Expense not found.", 404);
  await prisma.expense.delete({ where: { id } });
  return { id };
};

export const getMonthlySummary = async (hubId, month, year) => {
  if (!hubId) throw new AppError("Hub is required.", 400);
  const [expenses, feeAggregate] = await Promise.all([
    prisma.expense.findMany({ where: { hubId, date: dateRange(month, year) }, select: { category: true, amount: true } }),
    prisma.meetingFeePayment.aggregate({
      where: { month: `${year}-${String(month).padStart(2, "0")}`, paymentStatus: "PAID", user: { memberProfile: { hubId } } },
      _sum: { amount: true },
    }),
  ]);
  const categoryBreakdown = expenses.reduce((result, expense) => {
    result[expense.category] = (result[expense.category] || 0) + Number(expense.amount);
    return result;
  }, {});
  const totalCollected = Number(feeAggregate._sum.amount || 0);
  const totalSpent = expenses.reduce((total, expense) => total + Number(expense.amount), 0);
  return { hubId, month, year, totalCollected, totalSpent, balance: totalCollected - totalSpent, categoryBreakdown };
};

export const getMemberHubId = async (userId) => {
  const profile = await prisma.memberProfile.findUnique({ where: { userId }, select: { hubId: true } });
  if (!profile?.hubId) throw new AppError("No hub is assigned to this member.", 404);
  return profile.hubId;
};
