import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { AppError } from "../middleware/errorHandler.js";
import { validateEvent } from "../validations/adminEventValidation.js";
import * as eventController from "../controllers/adminEventController.js";

const router = Router();
const posterUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) return cb(null, true);
    return cb(new Error("Please upload a JPG, PNG, or WebP poster."));
  },
});

const uploadPoster = (req, res, next) => {
  posterUpload.single("poster")(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return next(new AppError("Event poster must be under 5MB.", 400));
    }
    return next(new AppError(err.message || "Could not upload event poster.", 400));
  });
};

const parseEventData = (req, res, next) => {
  try {
    req.body = JSON.parse(req.body.data);
    return next();
  } catch {
    return next(new AppError("Event data must be valid JSON.", 400));
  }
};

router.use(requireAuth, requireAdmin);

router.get("/", eventController.getEvents);
router.get("/:id", eventController.getEvent);
router.post("/", uploadPoster, parseEventData, validateEvent, eventController.postEvent);
router.put("/:id", uploadPoster, parseEventData, validateEvent, eventController.putEvent);
router.delete("/:id", eventController.deleteEvent);

export default router;
