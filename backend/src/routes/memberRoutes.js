import { Router } from "express";
import * as memberController from "../controllers/memberController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { validate } from "../validations/onboardingValidation.js";
import { editMemberSchema } from "../validations/adminValidation.js";
import * as adminController from "../controllers/adminController.js";

const router = Router();

router.get("/me", requireAuth, memberController.getMe);
router.get("/", requireAuth, memberController.listMembers);
router.get("/me/full", requireAuth, memberController.getMyFullProfile);
router.put("/me", requireAuth, memberController.updateMyProfile);
router.get("/me/stats", requireAuth, memberController.getMyStats);
router.get("/me/upcoming-events", requireAuth, memberController.getMyUpcomingEvents);
// Admin lifecycle aliases keep the member resource API available at /api/members.
router.patch("/:userId/suspend", requireAuth, requireAdmin, adminController.suspendMember);
router.patch("/:userId/reactivate", requireAuth, requireAdmin, adminController.reactivateMember);
router.delete("/:userId", requireAuth, requireAdmin, adminController.deleteMember);
router.patch("/:userId", requireAuth, requireAdmin, validate(editMemberSchema), adminController.updateMember);
router.get("/:userId", requireAuth, memberController.getMemberDetail);


export default router;
