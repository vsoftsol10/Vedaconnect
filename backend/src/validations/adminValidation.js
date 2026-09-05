import { z } from "zod";

export const addMemberSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim()
    .transform(val => val.replace(/\D/g, ""))
    .transform(val => val.length === 12 && val.startsWith("91") ? val.slice(2) : val)
    .refine(val => val.length === 10, "Phone number must be exactly 10 digits"),
  businessName: z.string().trim().min(1, "Business name is required"),
  businessType: z.string().trim().min(1, "Business type is required"),
  businessCategory: z.string().trim().min(1, "Business category is required"),
  location: z.string().trim().min(1, "Location is required"),
  businessDescription: z.string().trim().optional().default(""),
  productsServices: z.string().trim().optional().default(""),
  hubId: z.string().uuid("Please select a hub"),
  planCode: z.string().trim().min(1, "Please select a membership plan"),
  joinedAt: z.string().optional().nullable(),
});

export const joinedDateSchema = z.object({
  joinedAt: z.string().trim().min(1, "Joined date is required"),
});

export const subscriptionSchema = z.object({
  name: z.string().trim().min(1, "Subscription name is required"),
  price: z.number().positive("Price must be greater than 0").optional(),
  basePrice: z.number().positive("Base price must be greater than 0").optional(),
  gstPercent: z.number().min(0, "GST cannot be negative").max(100, "GST must be 100 or less").default(18),
  billingCycle: z.string().trim().min(1, "Duration is required"),
  description: z.string().trim().optional().default(""),
  isActive: z.boolean().default(true),
  benefits: z.array(z.string().trim().min(1)).default([]),
  activeFrom: z.string().datetime().optional().nullable(),
  activeUntil: z.string().datetime().optional().nullable(),
}).refine((data) => data.basePrice || data.price, {
  message: "Base price is required",
  path: ["basePrice"],
});

export const adminProfileSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Enter a valid email"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});
