import crypto from "crypto";
import { prisma } from "../config/prismaClient.js";
import { AppError } from "../middleware/errorHandler.js";
import { getCurrentMonthKey } from "../utils/weekUtils.js";
import { createRazorpayOrder as createRazorpayApiOrder } from "../utils/razorpayUtils.js";
import { notifyAdmins } from "./notificationService.js";

const MEETING_FEE_AMOUNT = 1800;
const CURRENCY = "INR";

const getUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { memberProfile: true },
  });
  if (!user) throw new AppError("User not found.", 404);
  return user;
};

export const createMeetingFeeOrder = async (userId) => {
  const month = getCurrentMonthKey();
  const [user, existingPayment] = await Promise.all([
    getUser(userId),
    prisma.meetingFeePayment.findUnique({ where: { userId_month: { userId, month } } }),
  ]);

  if (existingPayment?.paymentStatus === "PAID") {
    throw new AppError("Meeting fee is already paid for this month.", 409);
  }

  const order = await createRazorpayApiOrder({
    amount: MEETING_FEE_AMOUNT * 100,
    currency: CURRENCY,
    receipt: `meeting_${month}_${Date.now()}`,
    notes: { userId, month, amount: String(MEETING_FEE_AMOUNT) },
  });

  await prisma.meetingFeePayment.upsert({
    where: { userId_month: { userId, month } },
    update: {
      amount: MEETING_FEE_AMOUNT,
      paymentStatus: "PENDING",
      razorpayOrderId: order.id,
      razorpayPaymentId: null,
      razorpaySignature: null,
      paidAt: null,
    },
    create: {
      userId,
      month,
      amount: MEETING_FEE_AMOUNT,
      paymentStatus: "PENDING",
      razorpayOrderId: order.id,
    },
  });

  return {
    keyId: process.env.RAZORPAY_KEY_ID,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    name: "VedaConnect",
    description: `Monthly meeting fee - ${month}`,
    prefill: {
      name: user.memberProfile?.fullName || "",
      email: user.email,
      contact: user.memberProfile?.phone || "",
    },
  };
};

export const verifyMeetingFeePayment = async ({
  userId,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) => {
  const month = getCurrentMonthKey();
  const payment = await prisma.meetingFeePayment.findUnique({
    where: { userId_month: { userId, month } },
    include: { user: { include: { memberProfile: true } } },
  });

  if (!payment) throw new AppError("Meeting fee payment not found. Create an order first.", 404);
  if (payment.paymentStatus === "PAID") throw new AppError("Meeting fee is already paid for this month.", 409);
  if (payment.razorpayOrderId !== razorpay_order_id) {
    throw new AppError("Payment order does not match this meeting fee.", 400);
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    await prisma.meetingFeePayment.update({
      where: { id: payment.id },
      data: {
        paymentStatus: "FAILED",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
    });
    throw new AppError("Payment verification failed. Please try again.", 400);
  }

  const updated = await prisma.meetingFeePayment.update({
    where: { id: payment.id },
    data: {
      paymentStatus: "PAID",
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paidAt: new Date(),
    },
  });

  await notifyAdmins({
    type: "MEETING_FEE_PAID",
    title: "Meeting fee paid",
    message: `${payment.user.memberProfile?.fullName || payment.user.email} paid the ${month} meeting fee.`,
    relatedUserId: userId,
    link: "/admin/leaderboard",
  });

  return { month, paymentStatus: updated.paymentStatus, paidAt: updated.paidAt };
};

export const getMyMeetingFeeStatus = async (userId) => {
  const month = getCurrentMonthKey();
  const payment = await prisma.meetingFeePayment.findUnique({
    where: { userId_month: { userId, month } },
  });

  return {
    month,
    amount: MEETING_FEE_AMOUNT,
    paymentStatus: payment?.paymentStatus || "PENDING",
    paidAt: payment?.paidAt || null,
  };
};

export const getMonthlyMeetingFeeList = async (month = getCurrentMonthKey()) => {
  const [members, payments] = await Promise.all([
    prisma.user.findMany({
      where: { role: "MEMBER", memberProfile: { isNot: null } },
      include: { memberProfile: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.meetingFeePayment.findMany({ where: { month } }),
  ]);

  const paymentByUser = new Map(payments.map((payment) => [payment.userId, payment]));
  return members.map((member) => {
    const payment = paymentByUser.get(member.id);
    return {
      userId: member.id,
      fullName: member.memberProfile?.fullName || member.email,
      profilePhoto: member.memberProfile?.profilePhoto,
      businessName: member.memberProfile?.businessName,
      month,
      amount: MEETING_FEE_AMOUNT,
      paymentStatus: payment?.paymentStatus || "PENDING",
      paidAt: payment?.paidAt || null,
    };
  });
};
