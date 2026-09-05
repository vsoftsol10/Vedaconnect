import crypto from "crypto";
import bcrypt from "bcrypt";
import { prisma } from "../config/prismaClient.js";
import { supabaseStorage } from "../config/supabaseStorageClient.js";
import { AppError } from "../middleware/errorHandler.js";
import { sendWelcomeCredentialsEmail } from "./emailService.js";
import { getMyFullProfile } from "./memberService.js";
import { generateMemberId } from "../utils/generateMemberId.js";
import { generateTemporaryPassword } from "../utils/generatePassword.js";
import { generateMembershipInvoice } from "./invoiceService.js";
import { notifyAdmins } from "./notificationService.js";
import { createRazorpayOrder as createRazorpayApiOrder } from "../utils/razorpayUtils.js";
import { calculateExpiryDate } from "../utils/membershipDates.js";

const CERTIFICATES_BUCKET = "business-certificates";
const CURRENCY = "INR";

const sanitizeStorageFilename = (filename) => {
  const normalizedName = filename.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  const extensionIndex = normalizedName.lastIndexOf(".");
  const hasExtension = extensionIndex > 0;
  const rawBaseName = hasExtension ? normalizedName.slice(0, extensionIndex) : normalizedName;
  const rawExtension = hasExtension ? normalizedName.slice(extensionIndex) : "";

  const safeBaseName =
    rawBaseName
      .replace(/[^A-Za-z0-9.-]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^[._-]+|[._-]+$/g, "") || "certificate";

  const safeExtension = rawExtension.replace(/[^A-Za-z0-9.]/g, "");

  return `${safeBaseName}${safeExtension}`;
};

const getPlanPriceBreakdown = (plan) => {
  const baseAmount = Number(plan.baseAmount);
  const gstPercent = Number(plan.gstPercent);
  const totalAmount = Number(plan.amount);
  const gstAmount = totalAmount - baseAmount;

  return {
    baseAmount,
    gstPercent,
    gstAmount,
    totalAmount,
    totalAmountPaise: Math.round(totalAmount * 100),
  };
};

/**
 * Step 1: Personal Details
 * Creates User + MemberProfile in a single transaction — if the profile
 * insert fails, the user insert rolls back too. Returns userId for the
 * frontend to carry through steps 2-5.
 */
export const submitPersonalDetails = async ({ fullName, email, phone, location }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError("An account with this email already exists.", 409);
  }

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: { email, role: "MEMBER", status: "PENDING" },
    });

    await tx.memberProfile.create({
      data: {
        userId: newUser.id,
        fullName,
        phone,
        location,
      },
    });

    return newUser;
  });

  return { userId: user.id };
};

/**
 * Step 2: Business Details
 * Updates the MemberProfile row created in Step 1.
 */
export const submitBusinessDetails = async ({
  userId,
  businessName,
  businessCategory,
  businessLocation,
  businessDescription,
}) => {
  const profile = await prisma.memberProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new AppError("Member profile not found for this user. Complete Step 1 first.", 404);
  }

  await prisma.memberProfile.update({
    where: { userId },
    data: {
      businessName,
      businessCategory,
      businessLocation,
      businessDescription,
    },
  });

  return { userId };
};

/**
 * Step 3: Business Certificates
 * File bytes go to Supabase Storage; one reference row per file goes through Prisma.
 */
export const submitBusinessCertificates = async ({ userId, files }) => {
  const uploadedCertificates = [];

  for (const [index, file] of files.entries()) {
    const sanitizedName = sanitizeStorageFilename(file.originalname);
    const filePath = `${userId}/${Date.now()}-${index + 1}-${sanitizedName}`;

    const { error: uploadError } = await supabaseStorage.storage
      .from(CERTIFICATES_BUCKET)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      throw new AppError(`Could not upload certificate: ${uploadError.message}`, 500);
    }

    const certificate = await prisma.businessCertificate.create({
      data: {
        userId,
        filePath,
        fileName: file.originalname,
        fileSizeBytes: file.size,
        mimeType: file.mimetype,
      },
    });

    uploadedCertificates.push(certificate);
  }

  return { userId, certificates: uploadedCertificates };
};

export const getBusinessCertificates = async (userId) => {
  return prisma.businessCertificate.findMany({
    where: { userId },
    orderBy: { uploadedAt: "asc" },
  });
};

export const removeBusinessCertificate = async (certificateId) => {
  const certificate = await prisma.businessCertificate.findUnique({
    where: { id: certificateId },
  });

  if (!certificate) {
    throw new AppError("Business certificate not found.", 404);
  }

  const { error: deleteError } = await supabaseStorage.storage
    .from(CERTIFICATES_BUCKET)
    .remove([certificate.filePath]);

  if (deleteError) {
    throw new AppError(`Could not remove certificate: ${deleteError.message}`, 500);
  }

  await prisma.businessCertificate.delete({ where: { id: certificateId } });

  return { certificateId };
};

/**
 * Step 4: Membership Plan
 * Pricing always read from the DB — never trusted from the frontend.
 */
export const getActiveMembershipPlans = async () => {
  const now = new Date();

  const plans = await prisma.membershipPlan.findMany({
    where: {
      isActive: true,
      AND: [
        { OR: [{ activeFrom: null }, { activeFrom: { lte: now } }] },
        { OR: [{ activeUntil: null }, { activeUntil: { gte: now } }] },
      ],
    },
    orderBy: { amount: "asc" },
    select: {
      planCode: true, name: true, badge: true, amount: true,
      baseAmount: true, gstPercent: true, billingCycle: true, benefits: true,
    },
  });

  return plans;
};

export const submitMembershipSelection = async ({ userId, planCode }) => {
  const plan = await prisma.membershipPlan.findFirst({
    where: { planCode, isActive: true },
  });

  if (!plan) {
    throw new AppError("Selected membership plan does not exist.", 404);
  }

  await prisma.membership.upsert({
    where: { userId },
    update: {
      membershipType: plan.planCode,
      membershipStatus: "PENDING_PAYMENT",
      amount: plan.amount,
      paymentStatus: "PENDING",
    },
    create: {
      userId,
      membershipType: plan.planCode,
      membershipStatus: "PENDING_PAYMENT",
      amount: plan.amount,
      paymentStatus: "PENDING",
    },
  });

  return { userId, planCode: plan.planCode, amount: plan.amount };
};

export const createRazorpayMembershipOrder = async ({ userId }) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { memberProfile: true },
  });

  if (!user) {
    throw new AppError("User not found. Complete Step 1 first.", 404);
  }

  const membership = await prisma.membership.findUnique({ where: { userId } });
  if (!membership) {
    throw new AppError("Membership not found for this user. Complete Step 4 first.", 404);
  }

  const plan = await prisma.membershipPlan.findFirst({
    where: { planCode: membership.membershipType, isActive: true },
  });
  if (!plan) {
    throw new AppError("Selected membership plan does not exist.", 404);
  }

  const pricing = getPlanPriceBreakdown(plan);

  const order = await createRazorpayApiOrder({
    amount: pricing.totalAmountPaise,
    currency: CURRENCY,
    receipt: `vc_${Date.now()}`,
    notes: {
      userId,
      planCode: membership.membershipType,
      baseAmount: String(pricing.baseAmount),
      gstPercent: String(pricing.gstPercent),
      gstAmount: String(pricing.gstAmount),
      totalAmount: String(pricing.totalAmount),
    },
  });

  await prisma.membership.update({
    where: { userId },
    data: {
      amount: plan.amount,
      paymentStatus: "PENDING",
      membershipStatus: "PENDING_PAYMENT",
      razorpayOrderId: order.id,
      razorpayPaymentId: null,
      razorpaySignature: null,
      paymentReference: null,
      paidAt: null,
    },
  });

  return {
    keyId: process.env.RAZORPAY_KEY_ID,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    name: "VedaConnect",
    description: "Founder Member membership",
    prefill: {
      name: user.memberProfile?.fullName || "",
      email: user.email,
      contact: user.memberProfile?.phone || "",
    },
  };
};

export const verifyRazorpayMembershipPayment = async ({
  userId,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) => {
  const membership = await prisma.membership.findUnique({ where: { userId } });
  if (!membership) {
    throw new AppError("Membership not found for this user. Complete Step 4 first.", 404);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { memberProfile: true },
  });
  if (!user || !user.memberProfile) {
    throw new AppError("Member profile not found for this user.", 404);
  }

  const plan = await prisma.membershipPlan.findUnique({
    where: { planCode: membership.membershipType },
  });
  if (!plan) {
    throw new AppError("Selected membership plan does not exist.", 404);
  }

  if (membership.razorpayOrderId !== razorpay_order_id) {
    throw new AppError("Payment order does not match this membership.", 400);
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    await prisma.membership.update({
      where: { userId },
      data: {
        paymentStatus: "FAILED",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
    });
    throw new AppError("Payment verification failed. Please try again.", 400);
  }

  const shouldSendWelcomeEmail = membership.membershipStatus !== "ACTIVE" || !membership.memberId || !user.passwordHash;
  const memberId = membership.memberId || (await generateMemberId());
  const tempPassword = user.passwordHash ? null : generateTemporaryPassword();
  const passwordHash = tempPassword ? await bcrypt.hash(tempPassword, 10) : user.passwordHash;
  const now = new Date();
  const joinedAt = membership.joinedAt || now;
  const expiresAt = calculateExpiryDate(joinedAt, plan.billingCycle);

  const updated = await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        status: "ACTIVE",
        passwordHash,
      },
    });

    return tx.membership.update({
      where: { userId },
      data: {
        memberId,
        amount: plan.amount,
        paymentStatus: "PAID",
        membershipStatus: "ACTIVE",
        paymentReference: razorpay_payment_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paidAt: membership.paidAt || now,
        joinedAt,
        expiresAt,
      },
      select: {
        userId: true,
        memberId: true,
        membershipStatus: true,
        paymentStatus: true,
        paymentReference: true,
        razorpayOrderId: true,
        razorpayPaymentId: true,
        paidAt: true,
        expiresAt: true,
      },
    });
  });

  if (shouldSendWelcomeEmail) {
    try {
      const profile = await getMyFullProfile(userId);
      await sendWelcomeCredentialsEmail({
        toEmail: user.email,
        fullName: user.memberProfile.fullName,
        memberId,
        tempPassword: tempPassword || "Already set",
        profile,
        paymentMethod: "Razorpay",
        paymentReference: razorpay_payment_id,
      });
    } catch (error) {
      console.error("[WELCOME_EMAIL_FAILED]", {
        message: error?.message,
        userId,
        memberId,
      });
    }
  }

  try {
    await generateMembershipInvoice(membership.id, "Razorpay");
    await notifyAdmins({
      type: "MEMBERSHIP_PAYMENT_PAID",
      title: "Membership payment received",
      message: `${user.memberProfile.fullName} paid ${plan.name}.`,
      link: "/admin/payment-history",
    });
  } catch (error) {
    console.error("[PAYMENT_POST_PROCESSING_FAILED]", {
      message: error?.message,
      stack: error?.stack,
      userId,
      membershipId: membership.id,
    });
  }

  try {
    return {
      userId: updated.userId,
      memberId: updated.memberId,
      membershipStatus: updated.membershipStatus,
      paymentStatus: updated.paymentStatus,
      paymentReference: updated.paymentReference,
      razorpayOrderId: updated.razorpayOrderId,
      razorpayPaymentId: updated.razorpayPaymentId,
      paidAt: updated.paidAt,
      expiresAt: updated.expiresAt,
    };
  } catch (error) {
    console.error("[RAZORPAY VERIFY POST_EMAIL_RESPONSE_ERROR]", {
      message: error?.message,
      stack: error?.stack,
      userId,
      memberId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    return {
      userId,
      memberId,
      membershipStatus: "ACTIVE",
      paymentStatus: "PAID",
      paymentReference: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      paidAt: now,
      expiresAt,
    };
  }
};

/**
 * Step 5: Payment confirmation ("I've completed the payment" checkbox)
 * Does NOT auto-activate the account or generate a Member ID — an admin
 * verifies the WhatsApp payment first (next phase).
 */
export const confirmPaymentSubmitted = async ({ userId, paymentReference }) => {
  const membership = await prisma.membership.findUnique({
    where: { userId },
    include: { user: { include: { memberProfile: true } } },
  });
  if (!membership) {
    throw new AppError("Membership not found for this user. Complete Step 4 first.", 404);
  }

  const updated = await prisma.membership.update({
    where: { userId },
    data: { paymentReference: paymentReference || null },
    select: { userId: true, membershipStatus: true, paymentStatus: true },
  });

  try {
    await notifyAdmins({
      type: "MEMBERSHIP_PAYMENT_SUBMITTED",
      title: "Membership payment submitted",
      message: `${membership.user.memberProfile?.fullName || membership.user.email} submitted membership payment for verification.`,
      link: "/admin/payment-history",
    });
  } catch (error) {
    console.error("[MEMBERSHIP_PAYMENT_NOTIFICATION_FAILED]", {
      message: error?.message,
      userId,
      membershipId: membership.id,
    });
  }

  return updated;
};
