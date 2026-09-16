import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { validate } from "../validations/onboardingValidation.js";
import { validateQuery } from "../validations/networkingValidation.js";
import { expenseNotificationSchema, expenseQuerySchema, expenseSchema } from "../validations/expenseValidation.js";
import * as controller from "../controllers/expenseController.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const parseData = (req, res, next) => { if (req.body?.data) req.body = JSON.parse(req.body.data); next(); };

router.get("/summary", requireAuth, validateQuery(expenseQuerySchema), controller.summary);
router.get("/notification-logs", requireAuth, requireAdmin, validateQuery(expenseNotificationSchema), controller.notificationLogs);
router.post("/notify", requireAuth, requireAdmin, validate(expenseNotificationSchema), controller.notify);
router.get("/", requireAuth, requireAdmin, validateQuery(expenseQuerySchema), controller.list);
router.post("/", requireAuth, requireAdmin, upload.single("receipt"), parseData, validate(expenseSchema), controller.create);
router.put("/:id", requireAuth, requireAdmin, upload.single("receipt"), parseData, validate(expenseSchema), controller.update);
router.delete("/:id", requireAuth, requireAdmin, controller.remove);

export default router;
