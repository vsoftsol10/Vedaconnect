import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { validateEvent } from "../validations/adminEventValidation.js";
import * as eventController from "../controllers/adminEventController.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/", eventController.getEvents);
router.get("/:id", eventController.getEvent);
router.post("/", validateEvent, eventController.postEvent);
router.put("/:id", validateEvent, eventController.putEvent);
router.delete("/:id", eventController.deleteEvent);

export default router;
