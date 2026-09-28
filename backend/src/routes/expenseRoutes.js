import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { validate } from "../validations/onboardingValidation.js";
import { validateQuery } from "../validations/networkingValidation.js";
import { expenseNotificationSchema, expenseQuerySchema, expenseSchema, manualFeeQuerySchema, manualFeeSchema } from "../validations/expenseValidation.js";
import * as controller from "../controllers/expenseController.js";

const router = Router();
const allowedReceiptTypes = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
const allowedReceiptExtensions = /\.(pdf|jpe?g|png|webp)$/i;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const manualReceiptUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, callback) => {
  const valid = allowedReceiptTypes.has(file.mimetype) && allowedReceiptExtensions.test(file.originalname || "");
  callback(valid ? null : new Error("Receipt must be a PDF, JPG, PNG, or WebP file."), valid);
} });
const parseData = (req, res, next) => { if (req.body?.data) req.body = JSON.parse(req.body.data); next(); };

router.get("/summary", requireAuth, validateQuery(expenseQuerySchema), controller.summary);
router.get("/notification-logs", requireAuth, requireAdmin, validateQuery(expenseNotificationSchema), controller.notificationLogs);
router.get("/categories", requireAuth, requireAdmin, controller.categories);
router.post("/notify", requireAuth, requireAdmin, validate(expenseNotificationSchema), controller.notify);
router.get("/manual-fees", requireAuth, requireAdmin, validateQuery(manualFeeQuerySchema), controller.listManualFees);
router.get("/manual-fees/:id/receipt-url", requireAuth, requireAdmin, controller.manualFeeReceiptUrl);
router.post("/manual-fees", requireAuth, requireAdmin, manualReceiptUpload.single("receipt"), parseData, validate(manualFeeSchema), controller.createManualFee);
router.put("/manual-fees/:id", requireAuth, requireAdmin, manualReceiptUpload.single("receipt"), parseData, validate(manualFeeSchema), controller.updateManualFee);
router.delete("/manual-fees/:id", requireAuth, requireAdmin, controller.removeManualFee);
router.get("/", requireAuth, requireAdmin, validateQuery(expenseQuerySchema), controller.list);
router.post("/", requireAuth, requireAdmin, upload.single("receipt"), parseData, validate(expenseSchema), controller.create);
router.put("/:id", requireAuth, requireAdmin, upload.single("receipt"), parseData, validate(expenseSchema), controller.update);
router.delete("/:id", requireAuth, requireAdmin, controller.remove);

export default router;
