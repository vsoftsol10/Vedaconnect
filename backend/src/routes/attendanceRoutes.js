import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { leaderboardQuerySchema, validateQuery } from "../validations/networkingValidation.js";
import * as attendanceController from "../controllers/attendanceController.js";

const router = Router();

router.post("/confirm", requireAuth, attendanceController.confirm);
router.post("/decline", requireAuth, attendanceController.decline);
router.get("/me", requireAuth, attendanceController.getMine);
router.get(
  "/week",
  requireAuth,
  requireAdmin,
  validateQuery(leaderboardQuerySchema),
  attendanceController.getWeek
);

export default router;
