import jwt from "jsonwebtoken";
import { AppError } from "./errorHandler.js";

export const createOnboardingSession = (userId) => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured.");
  return jwt.sign({ userId, purpose: "ONBOARDING" }, process.env.JWT_SECRET, { expiresIn: "2h" });
};

export const requireOnboardingSession = (req, res, next) => {
  const token = req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.slice(7) : null;
  if (!token) return next(new AppError("A valid onboarding session is required.", 401));
  try {
    const session = jwt.verify(token, process.env.JWT_SECRET);
    if (session.purpose !== "ONBOARDING" || !session.userId) throw new Error("Invalid onboarding session.");
    req.onboardingSession = { userId: session.userId };
    next();
  } catch {
    next(new AppError("Invalid or expired onboarding session.", 401));
  }
};
