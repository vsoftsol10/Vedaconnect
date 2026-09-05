import { z } from "zod";
import { validate } from "./onboardingValidation.js";

const scheduleItemSchema = z.object({
  time: z.string().min(1),
  item: z.string().min(1),
});

const eventSchema = z.object({
  title: z.string().trim().min(2, "Event name is required"),
  description: z.string().trim().min(1, "Description is required"),
  aboutEvent: z.string().optional(),
  eventDate: z.coerce.date(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().trim().min(2, "Location is required"),
  hubId: z.string().uuid("Select a hub").optional(),
  schedule: z.array(scheduleItemSchema).optional().default([]),
  registrationDeadline: z.coerce.date(),
  maxMembers: z.coerce.number().int().positive().optional().nullable(),
  isPaid: z.boolean().default(true),
  registrationAmount: z.coerce.number().nonnegative().optional().default(0),
});

const validateEvent = validate(eventSchema);

export { eventSchema, validateEvent };
