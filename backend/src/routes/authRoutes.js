import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as authController from "../controllers/authController.js";
import { validate } from "../validations/onboardingValidation.js";
import { adminLoginSchema, forgotPasswordSchema, loginSchema, resetPasswordSchema } from "../validations/authValidation.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

const passwordResetIpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many password reset requests. Please try again in an hour." },
});

const passwordResetIdentifierLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => String(req.body?.memberId || "").trim().toUpperCase(),
  message: { success: false, message: "Too many password reset requests. Please try again in an hour." },
});

router.post("/login", validate(loginSchema), authController.login);
router.post("/admin-login", validate(adminLoginSchema), authController.adminLogin);
router.post("/forgot-password", passwordResetIpLimiter, validate(forgotPasswordSchema), passwordResetIdentifierLimiter, authController.forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);
router.get("/me", requireAuth, authController.me);

export default router;
