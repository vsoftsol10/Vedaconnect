import { z } from "zod";

export const loginSchema = z.object({
  memberId: z.string().trim().min(1, "Member ID is required"),
  password: z.string().min(1, "Password is required"),
  hub: z.string().trim().optional(),
});

export const adminLoginSchema = z.object({
  email: z.string().trim().email("Enter a valid admin email"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  memberId: z.string().trim().min(1, "Member ID is required"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset link is invalid or incomplete"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const changeMemberPasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});
