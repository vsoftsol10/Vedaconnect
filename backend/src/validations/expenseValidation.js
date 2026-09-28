import { z } from "zod";

const normalizeCategoryInput = (value) => typeof value === "string" ? value.replace(/\s+/g, " ").trim() : value;
const categorySchema = z.preprocess(normalizeCategoryInput, z.string().min(2, "Category must be at least 2 characters").max(60, "Category must be 60 characters or fewer").refine((value) => !/[\x00-\x1F\x7F]/.test(value), "Category cannot contain control characters"));

export const expenseSchema = z.object({
  hubId: z.string().uuid("Please select a hub"),
  date: z.string().trim().min(1, "Date is required").refine((value) => !Number.isNaN(new Date(value).getTime()), "Enter a valid date"),
  category: categorySchema,
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  description: z.string().trim().min(1, "Description is required").max(1000),
  receiptUrl: z.string().url().optional().nullable(),
});

export const expenseQuerySchema = z.object({
  hubId: z.string().uuid().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2020).max(2100).optional(),
});

export const expenseNotificationSchema = z.object({
  hubId: z.string().uuid("Please select a hub"),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2100),
});

const money = z.coerce.number().positive("Amount must be greater than zero").refine((value) => Number.isInteger(value * 100), "Amount can have at most 2 decimal places");
const meetingWeek = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Meeting week is required").refine((value) => !Number.isNaN(new Date(`${value}T00:00:00+05:30`).getTime()), "Enter a valid meeting week");

export const manualFeeSchema = z.object({
  hubId: z.string().uuid("Please select a hub"),
  memberId: z.string().uuid("Please select a member"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Collection date is required").refine((value) => !Number.isNaN(new Date(`${value}T00:00:00+05:30`).getTime()), "Enter a valid collection date"),
  meetingWeek,
  amount: money,
  paymentMode: z.enum(["CASH", "UPI", "BANK_TRANSFER"], { errorMap: () => ({ message: "Choose a payment mode" }) }),
  note: z.string().trim().max(200, "Note must be 200 characters or fewer").optional().default(""),
});

export const manualFeeQuerySchema = z.object({
  hubId: z.string().uuid("Please select a hub"),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Month must be YYYY-MM"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});
