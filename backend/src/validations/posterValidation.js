import { z } from "zod";
import { validate } from "./onboardingValidation.js";

export const POSTER_CATEGORIES = ["ONBOARDING_GUIDE", "RULES", "EVENT", "GENERAL"];
export const POSTER_AUDIENCES = ["ALL_MEMBERS", "NEW_MEMBERS"];

const optionalText = (max) => z.string().trim().max(max).optional().transform((value) => value || null);
export const posterSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(150, "Title must be 150 characters or fewer."),
  caption: optionalText(1000),
  category: z.enum(POSTER_CATEGORIES),
  audience: z.enum(POSTER_AUDIENCES).default("ALL_MEMBERS"),
});

export const validatePoster = validate(posterSchema);
