import { Router } from "express";
import * as eventController from "../controllers/eventController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/upcoming", requireAuth, eventController.listUpcoming);
router.get("/past", requireAuth, eventController.listPast);
router.get("/mine", requireAuth, eventController.listMine);
router.get("/:eventId", requireAuth, eventController.getDetail);
router.post("/:eventId/register", requireAuth, eventController.register);

export default router;