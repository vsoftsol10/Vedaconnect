import { z } from "zod";

export const personalDetailsSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().min(8, "Enter a valid phone number"),
  location: z.string().trim().min(1, "Location is required"),
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
  userId: z.string().uuid("Invalid user id"),
  paymentReference: z.string().trim().optional(),
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
