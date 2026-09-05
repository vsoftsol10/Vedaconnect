import { z } from "zod";
import { validate } from "./onboardingValidation.js";

const hubSchema = z.object({
  name: z.string().trim().min(2, "Hub name is required"),
  location: z.string().trim().min(2, "Location is required"),
  description: z.string().optional(),
  coordinatorName: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

const validateHub = validate(hubSchema);

export { hubSchema, validateHub };
