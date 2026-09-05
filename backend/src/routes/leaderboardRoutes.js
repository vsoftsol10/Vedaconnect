import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { leaderboard } from "../controllers/networkingController.js";
import { leaderboardQuerySchema, validateQuery } from "../validations/networkingValidation.js";

const router = Router();

router.get("/", requireAuth, validateQuery(leaderboardQuerySchema), leaderboard);

export default router;
