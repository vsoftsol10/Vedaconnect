import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { validateHub } from "../validations/hubValidation.js";
import * as hubController from "../controllers/hubController.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/", hubController.getHubs);
router.get("/:id", hubController.getHub);
router.post("/", validateHub, hubController.postHub);
router.put("/:id", validateHub, hubController.putHub);
router.delete("/:id", hubController.deleteHub);

export default router;
