import { z } from "zod";
import { validate } from "./onboardingValidation.js";

const scheduleItemSchema = z.object({
  time: z.string().min(1),
  item: z.string().min(1),
});

const eventPayloadSchema = z.object({
  title: z.string().trim().min(2, "Event name is required"),
  description: z.string().trim().min(1, "Description is required"),
  aboutEvent: z.string().optional(),
  eventDate: z.coerce.date(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().trim().min(2, "Location is required"),
  hubId: z.string().uuid("Select a hub").optional(),
  schedule: z.array(scheduleItemSchema).optional().default([]),
  registrationDeadline: z.coerce.date().optional(),
  eventType: z.enum(["FEE", "NO_FEE"]).default("FEE"),
  registrationAmount: z.coerce.number().nonnegative().optional().default(0),
}).superRefine((data, ctx) => {
  if (data.eventType === "FEE" && data.registrationAmount <= 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["registrationAmount"], message: "Event fee is required" });
  }
  if (data.eventType === "FEE" && !data.registrationDeadline) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["registrationDeadline"], message: "Registration deadline is required" });
  }
});

// Support the previously deployed admin form while clients refresh to the
// eventType-based payload. Without this, its `isPaid: false` submission would
// be treated as the default FEE event and incorrectly require a fee/deadline.
const eventSchema = z.preprocess((input) => {
  if (!input || typeof input !== "object" || Array.isArray(input)) return input;
  if (input.eventType || typeof input.isPaid !== "boolean") return input;
  return { ...input, eventType: input.isPaid ? "FEE" : "NO_FEE" };
}, eventPayloadSchema);

const validateEvent = validate(eventSchema);

export { eventSchema, validateEvent };
