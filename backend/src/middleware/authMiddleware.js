import jwt from "jsonwebtoken";
import { AppError } from "./errorHandler.js";

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("Not authenticated.", 401));
  }
  if (!process.env.JWT_SECRET) {
    return next(new Error("JWT_SECRET is not configured."));
  }
  try {
    req.user = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
    next();
  } catch {
    next(new AppError("Invalid or expired token.", 401));
  }
};
