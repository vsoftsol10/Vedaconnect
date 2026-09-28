import { z } from "zod";

export const birthdaySchema = z.object({ birthMonth: z.number().int().min(1).max(12).optional().nullable(), birthDay: z.number().int().min(1).max(31).optional().nullable() }).superRefine((value, ctx) => {
  if ((value.birthMonth == null) !== (value.birthDay == null)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Choose both birthday month and day" });
  if (value.birthMonth && value.birthDay && new Date(Date.UTC(2000, value.birthMonth - 1, value.birthDay)).getUTCMonth() !== value.birthMonth - 1) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Choose a valid birthday day" });
});

const normalizePhone = (value) => {
  const digits = value.replace(/\D/g, "");
  return digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
};

const optionalBirthdayValue = z.preprocess((value) => value === "" ? null : value, z.coerce.number().int().min(1).max(31).nullable().optional());

export const personalDetailsSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  email: z.string().trim().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .transform(normalizePhone)
    .refine((value) => value.length === 10, "Phone number must be exactly 10 digits"),
  location: z.string().trim().min(1, "Location is required"),
  birthMonth: optionalBirthdayValue.refine((value) => value === undefined || value === null || value <= 12, "Choose a valid birthday month"),
  birthDay: optionalBirthdayValue,
  dateOfBirth: z.never().optional(),
}).superRefine((value, ctx) => {
  const birthdayIsProvided = value.birthMonth !== undefined || value.birthDay !== undefined;
  if (birthdayIsProvided && ((value.birthMonth == null) !== (value.birthDay == null))) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["birthDay"], message: "Choose both birthday month and day" });
  if (value.birthMonth && value.birthDay && new Date(Date.UTC(2000, value.birthMonth - 1, value.birthDay)).getUTCMonth() !== value.birthMonth - 1) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["birthDay"], message: "Choose a valid birthday day" });
});

export const businessDetailsSchema = z.object({
  userId: z.string().uuid("Invalid user id"),
  businessName: z.string().trim().min(1, "Business name is required"),
  businessCategory: z.string().trim().min(1, "Business category is required"),
  businessLocation: z.string().trim().min(1, "Business location is required"),
  businessDescription: z.string().trim().max(1000).optional().default(""),
});

export const membershipSchema = z.object({
  userId: z.string().uuid("Invalid user id"),
  planCode: z.string().trim().min(1, "planCode is required"),
});

export const paymentConfirmationSchema = z.object({
  paymentReference: z.string().trim().max(200).optional(),
});

export const razorpayOrderSchema = z.object({
  userId: z.string().uuid("Invalid user id"),
});

export const razorpayVerificationSchema = z.object({
  userId: z.string().uuid("Invalid user id"),
  razorpay_order_id: z.string().trim().min(1, "razorpay_order_id is required"),
  razorpay_payment_id: z.string().trim().min(1, "razorpay_payment_id is required"),
  razorpay_signature: z.string().trim().min(1, "razorpay_signature is required"),
});

/**
 * Express middleware factory: validates req.body against a zod schema.
 * Usage: router.post("/x", validate(personalDetailsSchema), controllerFn)
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });
  }
  req.validatedBody = result.data;
  next();
};
