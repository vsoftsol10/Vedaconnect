import { Router } from "express";
import multer from "multer";
import * as onboardingController from "../controllers/onboardingController.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  validate,
  personalDetailsSchema,
  businessDetailsSchema,
  membershipSchema,
  paymentConfirmationSchema,
  razorpayOrderSchema,
  razorpayVerificationSchema,
} from "../validations/onboardingValidation.js";

const router = Router();
const ACCEPTED_CERTIFICATE_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

// Certificates stay in memory briefly, then get streamed to Supabase Storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB, matches Step 3 UI
  fileFilter: (req, file, cb) => {
    if (ACCEPTED_CERTIFICATE_TYPES.includes(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error("Please upload PDF, JPG, or PNG files only."));
  },
});

const uploadCertificates = (req, res, next) => {
  upload.array("certificates", 5)(req, res, (err) => {
    if (!err) {
      next();
      return;
    }

    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_COUNT") {
      next(new AppError("You can upload up to 5 certificates.", 400));
      return;
    }

    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      next(new AppError("Each certificate must be under 5MB.", 400));
      return;
    }

    next(new AppError(err.message, 400));
  });
};

// Step 1
router.post("/personal-details", validate(personalDetailsSchema), onboardingController.personalDetails);

// Step 2
router.put("/business-details", validate(businessDetailsSchema), onboardingController.businessDetails);

// Step 3
router.post(
  "/business-certificate",
  uploadCertificates,
  onboardingController.businessCertificate
);
router.get("/business-certificate/:userId", onboardingController.listBusinessCertificates);
router.delete("/business-certificate/:certificateId", onboardingController.deleteBusinessCertificate);

// Step 4
router.get("/plans", onboardingController.getPlans);
router.post("/membership", validate(membershipSchema), onboardingController.selectMembership);

// Step 5
router.post(
  "/payment/create-order",
  validate(razorpayOrderSchema),
  onboardingController.createRazorpayOrder
);
router.post(
  "/payment/verify",
  validate(razorpayVerificationSchema),
  onboardingController.verifyRazorpayPayment
);
router.post(
  "/confirm-payment",
  validate(paymentConfirmationSchema),
  onboardingController.confirmPayment
);

export default router;
