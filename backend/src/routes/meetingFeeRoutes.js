import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { validate } from "../validations/onboardingValidation.js";
import {
  leaderboardQuerySchema,
  meetingFeeVerificationSchema,
  validateQuery,
} from "../validations/networkingValidation.js";
import * as meetingFeeController from "../controllers/meetingFeeController.js";

const router = Router();

router.post("/create-order", requireAuth, meetingFeeController.createOrder);
router.post("/verify", requireAuth, validate(meetingFeeVerificationSchema), meetingFeeController.verify);
router.get("/status", requireAuth, meetingFeeController.getStatus);
router.get(
  "/month",
  requireAuth,
  requireAdmin,
  validateQuery(leaderboardQuerySchema),
  meetingFeeController.getMonth
);

export default router;
