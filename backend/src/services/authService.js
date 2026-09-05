import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prismaClient.js";
import { AppError } from "../middleware/errorHandler.js";

export const loginUser = async ({ email, password, hub }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    throw new AppError("Invalid email or password.", 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (user.status !== "ACTIVE") {
    throw new AppError("Your account is not active yet.", 403);
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  // TODO: `hub` is accepted but not stored - member_profiles has no hub/location
  // column yet. Add one via a Prisma migration once you decide whether it's
  // set once at signup or changeable at login.

  return {
    token,
    user: { id: user.id, email: user.email, fullName: user.fullName, profilePhoto: user.profilePhoto, role: user.role },
  };
};

export const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, fullName: true, profilePhoto: true, role: true, status: true },
  });
  if (!user) throw new AppError("User not found.", 404);
  return user;
};
