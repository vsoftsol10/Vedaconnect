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
