import { z } from "zod";

const birthdayPart = z.preprocess(
  (value) => value === "" ? null : value,
  z.coerce.number().int().min(1).max(31).nullable().optional()
);

export const updateMyProfileSchema = z.object({
  fullName: z.string().trim().min(2).optional(),
  phone: z.string().trim().min(1).optional(),
  location: z.string().trim().optional(),
  businessName: z.string().trim().optional(),
  businessCategory: z.string().trim().optional(),
  businessLocation: z.string().trim().optional(),
  businessDescription: z.string().trim().max(1000).optional(),
  productsServices: z.string().trim().max(1000).optional(),
  birthMonth: birthdayPart.refine((value) => value === undefined || value === null || value <= 12, "Choose a valid birthday month"),
  birthDay: birthdayPart,
}).strict().superRefine((value, ctx) => {
  const birthdayIsProvided = value.birthMonth !== undefined || value.birthDay !== undefined;
  if (birthdayIsProvided && ((value.birthMonth == null) !== (value.birthDay == null))) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["birthDay"], message: "Choose both birthday month and day" });
  }
  if (value.birthMonth && value.birthDay && new Date(Date.UTC(2000, value.birthMonth - 1, value.birthDay)).getUTCMonth() !== value.birthMonth - 1) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["birthDay"], message: "Choose a valid birthday day" });
  }
});
