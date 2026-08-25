import { Router } from "express";
import * as memberController from "../controllers/memberController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/me", requireAuth, memberController.getMe);
router.get("/", requireAuth, memberController.listMembers);
router.get("/me/full", requireAuth, memberController.getMyFullProfile);
router.put("/me", requireAuth, memberController.updateMyProfile);
router.get("/:userId", requireAuth, memberController.getMemberDetail);
router.get("/me/stats", requireAuth, memberController.getMyStats);
router.get("/me/upcoming-events", requireAuth, memberController.getMyUpcomingEvents);


export default router;