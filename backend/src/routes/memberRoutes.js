import { Router } from "express";
import multer from "multer";
import * as memberController from "../controllers/memberController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { validate } from "../validations/onboardingValidation.js";
import { editMemberSchema } from "../validations/adminValidation.js";
import { changeMemberPasswordSchema } from "../validations/authValidation.js";
import { updateMyProfileSchema } from "../validations/memberValidation.js";
import * as adminController from "../controllers/adminController.js";
import { AppError } from "../middleware/errorHandler.js";
import { isAllowedDocumentFile } from "../services/documentService.js";

const router = Router();
const documentUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => cb(isAllowedDocumentFile(file) ? null : new Error("Only PDF, JPG, PNG, and WebP documents are allowed."), isAllowedDocumentFile(file)) });
const uploadDocument = (req, res, next) => documentUpload.single("file")(req, res, (error) => {
  if (!error) return next();
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") return next(new AppError("Document must be 5 MB or smaller.", 400));
  return next(new AppError(error.message || "Only PDF, JPG, PNG, and WebP documents are allowed.", 400));
});

router.get("/me", requireAuth, memberController.getMe);
router.get("/", requireAuth, memberController.listMembers);
router.get("/me/full", requireAuth, memberController.getMyFullProfile);
router.put("/me", requireAuth, validate(updateMyProfileSchema), memberController.updateMyProfile);
router.get("/documents", requireAuth, memberController.listMyDocuments);
router.post("/documents", requireAuth, uploadDocument, memberController.uploadMyDocument);
router.get("/documents/:id/url", requireAuth, memberController.getMyDocumentUrl);
router.delete("/documents/:id", requireAuth, memberController.deleteMyDocument);
router.put("/me/password", requireAuth, validate(changeMemberPasswordSchema), memberController.changeMyPassword);
router.get("/me/stats", requireAuth, memberController.getMyStats);
router.get("/me/upcoming-events", requireAuth, memberController.getMyUpcomingEvents);
router.get("/birthday-today", requireAuth, memberController.getBirthdayToday);
// Admin lifecycle aliases keep the member resource API available at /api/members.
router.patch("/:userId/suspend", requireAuth, requireAdmin, adminController.suspendMember);
router.patch("/:userId/reactivate", requireAuth, requireAdmin, adminController.reactivateMember);
router.delete("/:userId", requireAuth, requireAdmin, adminController.deleteMember);
router.patch("/:userId", requireAuth, requireAdmin, validate(editMemberSchema), adminController.updateMember);
router.get("/:userId", requireAuth, memberController.getMemberDetail);


export default router;
