import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../config/prismaClient.js";
import { AppError } from "../middleware/errorHandler.js";
import { sendPasswordResetEmail } from "./emailService.js";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
const RESET_REQUEST_MIN_RESPONSE_MS = 300;
const hashResetToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const createLoginResult = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  return {
    token,
    user: { id: user.id, email: user.email, fullName: user.fullName, profilePhoto: user.profilePhoto, role: user.role },
  };
};

export const loginUser = async ({ memberId, password, hub }) => {
  const membership = await prisma.membership.findUnique({
    where: { memberId: memberId.toUpperCase() },
    include: { user: true },
  });
  const user = membership?.user;
  if (!user || user.role !== "MEMBER" || !user.passwordHash) {
    throw new AppError("Invalid Member ID or password.", 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError("Invalid Member ID or password.", 401);
  }

  if (user.status !== "ACTIVE") {
    throw new AppError("Your account is not active yet.", 403);
  }

  // TODO: `hub` is accepted but not stored - member_profiles has no hub/location
  // column yet. Add one via a Prisma migration once you decide whether it's
  // set once at signup or changeable at login.

  return createLoginResult(user);
};

export const loginAdmin = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== "ADMIN" || !user.passwordHash) {
    throw new AppError("Invalid admin email or password.", 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError("Invalid admin email or password.", 401);
  }

  if (user.status !== "ACTIVE") {
    throw new AppError("Your account is not active yet.", 403);
  }

  return createLoginResult(user);
};

export const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, fullName: true, profilePhoto: true, role: true, status: true },
  });
  if (!user) throw new AppError("User not found.", 404);
  return user;
};

export const requestPasswordReset = async ({ memberId }) => {
  const normalizedMemberId = memberId.trim().toUpperCase();
  const [membership] = await Promise.all([
    prisma.membership.findUnique({
      where: { memberId: normalizedMemberId },
      include: { user: { include: { memberProfile: true } } },
    }),
    wait(RESET_REQUEST_MIN_RESPONSE_MS),
  ]);
  const user = membership?.user;

  // Always return success to avoid disclosing whether an account exists.
  if (!user || user.role !== "MEMBER" || user.status !== "ACTIVE" || !user.email) return;

  // Do not make the HTTP response timing depend on mail delivery or token
  // storage. The token is only ever present in the emailed reset URL.
  void (async () => {
    try {
      const token = crypto.randomBytes(32).toString("hex");
      await prisma.user.update({
        where: { id: user.id },
        data: { resetTokenHash: hashResetToken(token), resetTokenExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
      });
      const resetUrl = `${(process.env.FRONTEND_ORIGIN || "http://localhost:5173").replace(/\/$/, "")}/reset-password?token=${token}`;
      await sendPasswordResetEmail({ userId: user.id, toEmail: user.email, fullName: user.memberProfile?.fullName, resetUrl });
    } catch (error) {
      console.error("[PASSWORD_RESET_ISSUANCE_FAILED]", {
        message: error?.message,
        userId: user.id,
        email: user.email,
      });
    }
  })();
};

export const resetPassword = async ({ token, newPassword }) => {
  const user = await prisma.user.findFirst({
    where: { resetTokenHash: hashResetToken(token), resetTokenExpiresAt: { gt: new Date() }, role: "MEMBER" },
  });
  if (!user) throw new AppError("This reset link is invalid or has expired.", 400);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(newPassword, 10), resetTokenHash: null, resetTokenExpiresAt: null },
  });
};
