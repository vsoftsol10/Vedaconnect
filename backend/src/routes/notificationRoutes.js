import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import * as notificationController from "../controllers/notificationController.js";

const router = Router();

router.get("/", requireAuth, notificationController.getMine);
router.get("/unread-count", requireAuth, notificationController.getUnreadCount);
router.patch("/read-all", requireAuth, notificationController.markAllRead);
router.patch("/read", requireAuth, notificationController.markMineRead);
router.patch("/:id/read", requireAuth, notificationController.markOneRead);

export default router;
