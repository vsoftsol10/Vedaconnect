import { AppError } from "./errorHandler.js";

// Must run AFTER requireAuth, since it reads req.user set by that middleware.
export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    return next(new AppError("Admin access required.", 403));
  }
  next();
};