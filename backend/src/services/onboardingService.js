import crypto from "crypto";
import Razorpay from "razorpay";
import { prisma } from "../config/prismaClient.js";
import { supabaseStorage } from "../config/supabaseStorageClient.js";
import { AppError } from "../middleware/errorHandler.js";

const CERTIFICATES_BUCKET = "business-certificates";
const FOUNDER_MEMBER_PRICING = {
  membershipFee: 7000,
  gst: 1260,
  totalAmount: 8260,
  totalAmountPaise: 826000,
  currency: "INR",
};

const getRazorpayClient = () => {
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new AppError("Razorpay credentials are not configured.", 500);
  }

  return new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
};

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
  const plans = await prisma.membershipPlan.findMany({
    where: { isActive: true },
    orderBy: { amount: "asc" },
    select: {
      planCode: true,
      name: true,
      badge: true,
      amount: true,
      billingCycle: true,
      benefits: true,
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

  const razorpay = getRazorpayClient();
  const order = await razorpay.orders.create({
    amount: FOUNDER_MEMBER_PRICING.totalAmountPaise,
    currency: FOUNDER_MEMBER_PRICING.currency,
    receipt: `vc_${Date.now()}`,
    notes: {
      userId,
      planCode: membership.membershipType,
      membershipFee: String(FOUNDER_MEMBER_PRICING.membershipFee),
      gst: String(FOUNDER_MEMBER_PRICING.gst),
      totalAmount: String(FOUNDER_MEMBER_PRICING.totalAmount),
    },
  });

  await prisma.membership.update({
    where: { userId },
    data: {
      amount: FOUNDER_MEMBER_PRICING.totalAmount,
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

  const updated = await prisma.membership.update({
    where: { userId },
    data: {
      amount: FOUNDER_MEMBER_PRICING.totalAmount,
      paymentStatus: "PAID",
      membershipStatus: "ACTIVE",
      paymentReference: razorpay_payment_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paidAt: new Date(),
      joinedAt: new Date(),
    },
    select: {
      userId: true,
      membershipStatus: true,
      paymentStatus: true,
      paymentReference: true,
      razorpayOrderId: true,
      razorpayPaymentId: true,
      paidAt: true,
    },
  });

  return updated;
};

/**
 * Step 5: Payment confirmation ("I've completed the payment" checkbox)
 * Does NOT auto-activate the account or generate a Member ID — an admin
 * verifies the WhatsApp payment first (next phase).
 */
export const confirmPaymentSubmitted = async ({ userId, paymentReference }) => {
  const membership = await prisma.membership.findUnique({ where: { userId } });
  if (!membership) {
    throw new AppError("Membership not found for this user. Complete Step 4 first.", 404);
  }

  const updated = await prisma.membership.update({
    where: { userId },
    data: { paymentReference: paymentReference || null },
    select: { userId: true, membershipStatus: true, paymentStatus: true },
  });

  return updated;
};
