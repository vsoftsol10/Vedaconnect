import crypto from "crypto";
import { prisma } from "../config/prismaClient.js";
import { AppError } from "../middleware/errorHandler.js";
import { getCurrentMonthKey } from "../utils/weekUtils.js";
import { createRazorpayOrder as createRazorpayApiOrder } from "../utils/razorpayUtils.js";
import { notifyAdmins } from "./notificationService.js";
import { calculateExpiryDate } from "../utils/membershipDates.js";
import { getPlanForMembershipTier } from "../utils/membershipTier.js";

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
  const [payment, membership] = await Promise.all([
    prisma.meetingFeePayment.findUnique({ where: { userId_month: { userId, month } } }),
    prisma.membership.findUnique({ where: { userId }, include: { user: { select: { membershipTier: true } } } }),
  ]);
  const plan = membership ? await getPlanForMembershipTier(prisma, membership.user.membershipTier) : null;

  return {
    month,
    amount: MEETING_FEE_AMOUNT,
    paymentStatus: payment?.paymentStatus || "PENDING",
    paidAt: payment?.paidAt || null,
    renewalAmount: plan ? Number(plan.amount) : null,
  };
};

export const getMyMeetingFeeHistory = async (userId) => {
  const [membership, payments] = await Promise.all([
    prisma.membership.findUnique({ where: { userId }, select: { joinedAt: true, createdAt: true } }),
    prisma.meetingFeePayment.findMany({ where: { userId }, orderBy: { month: "desc" } }),
  ]);
  const byMonth = new Map(payments.map((payment) => [payment.month, payment]));
  const now = new Date();
  const firstMonth = membership?.joinedAt || membership?.createdAt || now;
  const cursor = new Date(firstMonth.getFullYear(), firstMonth.getMonth(), 1);
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const history = [];

  while (cursor <= currentMonth && history.length < 24) {
    const month = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    const payment = byMonth.get(month);
    history.push({
      month,
      amount: Number(payment?.amount || MEETING_FEE_AMOUNT),
      paymentStatus: payment?.paymentStatus || (cursor < currentMonth ? "OVERDUE" : "PENDING"),
      paidAt: payment?.paidAt || null,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return history.reverse();
};

const getRenewalContext = async (userId) => {
  const membership = await prisma.membership.findUnique({ where: { userId }, include: { user: { select: { membershipTier: true } } } });
  if (!membership) throw new AppError("Membership not found.", 404);
  const plan = await getPlanForMembershipTier(prisma, membership.user.membershipTier);
  if (plan.billingCycle?.toUpperCase().includes("LIFETIME")) throw new AppError("Lifetime memberships do not need renewal.", 400);
  const expiry = membership.expiresAt;
  if (!expiry || expiry.getTime() - Date.now() > 7 * 24 * 60 * 60 * 1000) {
    throw new AppError("Renewal becomes available within seven days of expiry.", 400);
  }
  return { membership, plan };
};

export const createMembershipRenewalOrder = async (userId) => {
  const [{ membership, plan }, user] = await Promise.all([getRenewalContext(userId), getUser(userId)]);
  const order = await createRazorpayApiOrder({
    amount: Number(plan.amount) * 100,
    currency: CURRENCY,
    receipt: `renewal_${membership.id}_${Date.now()}`,
    notes: { userId, membershipId: membership.id, purpose: "membership_renewal" },
  });
  await prisma.membership.update({
    where: { id: membership.id },
    data: { razorpayOrderId: order.id, paymentStatus: "PENDING" },
  });
  return {
    keyId: process.env.RAZORPAY_KEY_ID,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    name: "VedaConnect",
    description: `Membership renewal - ${plan.name}`,
    prefill: { name: user.memberProfile?.fullName || "", email: user.email, contact: user.memberProfile?.phone || "" },
  };
};

export const verifyMembershipRenewalPayment = async ({ userId, razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  const { membership, plan } = await getRenewalContext(userId);
  if (membership.razorpayOrderId !== razorpay_order_id) throw new AppError("Payment order does not match this renewal.", 400);
  const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
  if (expectedSignature !== razorpay_signature) {
    await prisma.membership.update({ where: { id: membership.id }, data: { paymentStatus: "FAILED" } });
    throw new AppError("Payment verification failed. Please try again.", 400);
  }
  const now = new Date();
  const renewalStart = membership.expiresAt > now ? membership.expiresAt : now;
  const expiresAt = calculateExpiryDate(renewalStart, plan.billingCycle);
  const updated = await prisma.membership.update({
    where: { id: membership.id },
    data: { paymentStatus: "PAID", membershipStatus: "ACTIVE", amount: plan.amount, paymentReference: razorpay_payment_id, razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, paidAt: now, expiresAt },
    select: { paymentStatus: true, paidAt: true, expiresAt: true },
  });
  return updated;
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
