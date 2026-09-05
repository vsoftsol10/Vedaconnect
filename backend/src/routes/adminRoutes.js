import { Router } from "express";
import multer from "multer";
import * as adminController from "../controllers/adminController.js";
import { adminLeaderboard } from "../controllers/networkingController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { AppError } from "../middleware/errorHandler.js";
import { validate } from "../validations/onboardingValidation.js";
import {
  addMemberSchema,
  joinedDateSchema,
  subscriptionSchema,
  adminProfileSchema,
  changePasswordSchema,
} from "../validations/adminValidation.js";
import { leaderboardQuerySchema, validateQuery } from "../validations/networkingValidation.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const profileUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error("Please upload a JPG, PNG, or WebP image."));
  },
});

const uploadProfilePhoto = (req, res, next) => {
  profileUpload.single("profilePhoto")(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return next(new AppError("Profile photo must be under 2MB.", 400));
    }
    return next(new AppError(err.message || "Could not upload profile photo.", 400));
  });
};

// Dashboard
router.get("/dashboard", requireAuth, requireAdmin, adminController.getDashboard);
router.get("/leaderboard", requireAuth, requireAdmin, validateQuery(leaderboardQuerySchema), adminLeaderboard);

// Members
router.get("/members", requireAuth, requireAdmin, adminController.listMembers);
router.get("/members/:userId", requireAuth, requireAdmin, adminController.getMemberDetail);
router.patch("/members/:userId/hub", requireAuth, requireAdmin, adminController.assignHub);
router.patch("/members/:userId/joined-date", requireAuth, requireAdmin, validate(joinedDateSchema), adminController.updateJoinedDate);
router.post(
  "/members",
  requireAuth, requireAdmin,
  upload.single("certificate"),
  (req, res, next) => { req.body = JSON.parse(req.body.data); next(); },
  validate(addMemberSchema),
  adminController.createMember
);

// Subscriptions
router.get("/subscriptions", requireAuth, requireAdmin, adminController.listSubscriptions);
router.post("/subscriptions", requireAuth, requireAdmin, validate(subscriptionSchema), adminController.createSubscriptionHandler);
router.put("/subscriptions/:id", requireAuth, requireAdmin, validate(subscriptionSchema), adminController.updateSubscriptionHandler);
router.patch("/subscriptions/:id/toggle", requireAuth, requireAdmin, adminController.toggleSubscriptionHandler);

// Payment History
router.get("/payments/membership", requireAuth, requireAdmin, adminController.listMembershipPaymentsHandler);
router.patch("/payments/membership/:id/verify", requireAuth, requireAdmin, adminController.verifyMembershipPaymentHandler);
router.patch("/payments/membership/:id/reject", requireAuth, requireAdmin, adminController.rejectMembershipPaymentHandler);

router.get("/payments/events", requireAuth, requireAdmin, adminController.listEventPaymentsHandler);
router.patch("/payments/events/:id/verify", requireAuth, requireAdmin, adminController.verifyEventPaymentHandler);
router.patch("/payments/events/:id/reject", requireAuth, requireAdmin, adminController.rejectEventPaymentHandler);

// Admin Profile
router.get("/profile", requireAuth, requireAdmin, adminController.getProfile);
router.put(
  "/profile",
  requireAuth, requireAdmin,
  uploadProfilePhoto,
  (req, res, next) => {
    if (req.body?.data) req.body = JSON.parse(req.body.data);
    next();
  },
  validate(adminProfileSchema),
  adminController.updateProfile
);
router.put("/profile/password", requireAuth, requireAdmin, validate(changePasswordSchema), adminController.changePassword);

export default router;
