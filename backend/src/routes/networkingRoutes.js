import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../validations/onboardingValidation.js";
import {
  businessReceivedSchema,
  leaderboardQuerySchema,
  referralSchema,
  validateQuery,
} from "../validations/networkingValidation.js";
import * as networkingController from "../controllers/networkingController.js";

const router = Router();

router.post("/referrals", requireAuth, validate(referralSchema), networkingController.createReferral);
router.get("/referrals/mine", requireAuth, networkingController.getMyReferrals);
router.post(
  "/business-received",
  requireAuth,
  validate(businessReceivedSchema),
  networkingController.createBusinessReceived
);
router.get("/business-received/mine", requireAuth, networkingController.getMyBusinessReceived);
router.get(
  "/leaderboard",
  requireAuth,
  validateQuery(leaderboardQuerySchema),
  networkingController.leaderboard
);
router.get(
  "/leaderboard/weekly",
  requireAuth,
  validateQuery(leaderboardQuerySchema),
  networkingController.weeklyLeaderboard
);
router.get(
  "/leaderboard/monthly",
  requireAuth,
  validateQuery(leaderboardQuerySchema),
  networkingController.monthlyLeaderboard
);

export default router;
