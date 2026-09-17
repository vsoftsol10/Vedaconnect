import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { validate } from "../validations/onboardingValidation.js";
import { adminLoginSchema, loginSchema } from "../validations/authValidation.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/login", validate(loginSchema), authController.login);
router.post("/admin-login", validate(adminLoginSchema), authController.adminLogin);
router.get("/me", requireAuth, authController.me);

export default router;
