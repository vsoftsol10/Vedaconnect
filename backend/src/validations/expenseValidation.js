import { z } from "zod";

export const EXPENSE_CATEGORIES = ["VENUE", "FOOD", "PRINTING", "DECORATION", "GUEST_SPEAKER", "MISCELLANEOUS", "OTHER"];

export const expenseSchema = z.object({
  hubId: z.string().uuid("Please select a hub"),
  date: z.string().trim().min(1, "Date is required").refine((value) => !Number.isNaN(new Date(value).getTime()), "Enter a valid date"),
  category: z.enum(EXPENSE_CATEGORIES),
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
