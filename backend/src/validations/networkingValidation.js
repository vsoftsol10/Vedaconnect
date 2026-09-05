import { z } from "zod";

const amountSchema = z.coerce
  .number()
  .positive("Amount must be greater than zero")
  .max(99999999, "Amount is too large");

export const referralSchema = z.object({
  receiverType: z.enum(["member", "external"]).optional().default("member"),
  receiverId: z.string().uuid("Invalid receiver id").optional().nullable(),
  externalName: z.string().trim().max(120, "Name is too long").optional().default(""),
  externalBusiness: z.string().trim().max(160, "Business/category is too long").optional().default(""),
  externalContact: z.string().trim().max(240, "Phone/note is too long").optional().default(""),
  amount: amountSchema,
  description: z.string().trim().max(1000).optional().default(""),
}).superRefine((data, ctx) => {
  if (data.receiverType === "member" && !data.receiverId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["receiverId"], message: "Select a member" });
  }
  if (data.receiverType === "external" && !data.externalName?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["externalName"], message: "External name is required" });
  }
});

export const businessReceivedSchema = z.object({
  referrerType: z.enum(["member", "external"]).optional().default("member"),
  referrerId: z.string().uuid("Invalid referrer id").optional().nullable(),
  externalName: z.string().trim().max(120, "Name is too long").optional().default(""),
  externalBusiness: z.string().trim().max(160, "Business/category is too long").optional().default(""),
  externalContact: z.string().trim().max(240, "Phone/note is too long").optional().default(""),
  amount: amountSchema,
  description: z.string().trim().max(1000).optional().default(""),
}).superRefine((data, ctx) => {
  if (data.referrerType === "member" && !data.referrerId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["referrerId"], message: "Select a member" });
  }
  if (data.referrerType === "external" && !data.externalName?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["externalName"], message: "External name is required" });
  }
});

export const leaderboardQuerySchema = z.object({
  period: z.enum(["week", "month", "year"]).optional().default("week"),
  value: z.string().trim().optional(),
  hub: z.string().trim().optional().default("all"),
  sort: z.enum(["referrals", "business"]).optional().default("business"),
}).superRefine((data, ctx) => {
  if (!data.value) return;
  if (data.period === "week" && !/^\d{4}-\d{2}-\d{2}$/.test(data.value)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["value"], message: "Week value must be YYYY-MM-DD" });
  }
  if (data.period === "month" && !/^\d{4}-\d{2}$/.test(data.value)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["value"], message: "Month value must be YYYY-MM" });
  }
  if (data.period === "year" && !/^\d{4}$/.test(data.value)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["value"], message: "Year value must be YYYY" });
  }
  if (data.hub !== "all" && !z.string().uuid().safeParse(data.hub).success) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["hub"], message: "Hub must be all or a hub id" });
  }
});

export const meetingFeeVerificationSchema = z.object({
  razorpay_order_id: z.string().trim().min(1, "razorpay_order_id is required"),
  razorpay_payment_id: z.string().trim().min(1, "razorpay_payment_id is required"),
  razorpay_signature: z.string().trim().min(1, "razorpay_signature is required"),
});

export const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });
  }
  req.validatedQuery = result.data;
  next();
};
