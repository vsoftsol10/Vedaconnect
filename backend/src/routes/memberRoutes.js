import { Router } from "express";
import * as memberController from "../controllers/memberController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/me", requireAuth, memberController.getMe);
router.get("/", requireAuth, memberController.listMembers);
router.get("/me/full", requireAuth, memberController.getMyFullProfile);
router.put("/me", requireAuth, memberController.updateMyProfile);
router.get("/me/stats", requireAuth, memberController.getMyStats);
router.get("/me/upcoming-events", requireAuth, memberController.getMyUpcomingEvents);
router.get("/:userId", requireAuth, memberController.getMemberDetail);


export default router;
