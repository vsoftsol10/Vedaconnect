import { prisma } from "../config/prismaClient.js";
import { buildPaymentInvoiceHtml, sendPaymentInvoiceEmail } from "./emailService.js";

const GST_PERCENT = 18;

const toNumber = (value) => Number(value || 0);

const splitInclusiveGst = (totalAmount, gstPercent = GST_PERCENT) => {
  const total = toNumber(totalAmount);
  const baseAmount = Number((total / (1 + gstPercent / 100)).toFixed(2));
  const gstAmount = Number((total - baseAmount).toFixed(2));
  return { baseAmount, gstAmount, totalAmount: total, gstPercent };
};

const nextInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const count = await prisma.paymentInvoice.count({
    where: { invoiceNumber: { startsWith: `VC-${year}-` } },
  });
  return `VC-${year}-${String(count + 1).padStart(6, "0")}`;
};

const sendAndMarkInvoice = async (invoice, data, invoiceDate) => {
  const freshInvoice = await prisma.paymentInvoice.findUnique({
    where: { id: invoice.id },
    select: { id: true, emailedAt: true },
  });
  if (freshInvoice?.emailedAt) return { ...invoice, emailedAt: freshInvoice.emailedAt };

  try {
    await sendPaymentInvoiceEmail({
      ...data,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate,
    });
    return prisma.paymentInvoice.update({
      where: { id: invoice.id },
      data: { emailedAt: new Date() },
    });
  } catch (error) {
    console.error("[INVOICE_EMAIL_FAILED]", {
      message: error?.message,
      responseData: error?.response?.data,
      stack: error?.stack,
      invoiceNumber: invoice.invoiceNumber,
      invoiceId: invoice.id,
      userId: data.userId,
      paymentType: data.paymentType,
      paymentRecordId: data.paymentRecordId,
      transactionId: data.transactionId,
    });
    return invoice;
  }
};

export const saveAndSendInvoice = async (data) => {
  const existing = await prisma.paymentInvoice.findFirst({
    where: {
      paymentType: data.paymentType,
      paymentRecordId: data.paymentRecordId,
    },
  });

  if (existing?.emailedAt) return existing;

  const invoiceDate = data.paymentDate || new Date();
  const invoiceNumber = existing ? existing.invoiceNumber : await nextInvoiceNumber();
  const invoice = existing || (await prisma.paymentInvoice.create({
    data: {
      invoiceNumber,
      userId: data.userId,
      paymentType: data.paymentType,
      paymentRecordId: data.paymentRecordId,
      itemName: data.itemName,
      baseAmount: data.baseAmount,
      gstPercent: data.gstPercent,
      gstAmount: data.gstAmount,
      totalAmount: data.totalAmount,
      paymentMethod: data.paymentMethod,
      transactionId: data.transactionId,
      htmlSnapshot: buildPaymentInvoiceHtml({
        ...data,
        invoiceNumber,
        invoiceDate,
      }),
    },
  }));

  return sendAndMarkInvoice(invoice, data, invoiceDate);
};

const buildMembershipInvoiceData = async (membershipId, paymentMethod = "WhatsApp") => {
  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
    include: { user: { include: { memberProfile: true } } },
  });
  if (!membership || membership.paymentStatus !== "PAID") return null;

  const plan = await prisma.membershipPlan.findFirst({
    where: { planCode: membership.membershipType },
  });
  const gstPercent = Number(plan?.gstPercent || GST_PERCENT);
  const pricing = plan
    ? {
        baseAmount: toNumber(plan.baseAmount),
        gstAmount: Number((toNumber(plan.amount) - toNumber(plan.baseAmount)).toFixed(2)),
        totalAmount: toNumber(plan.amount),
        gstPercent,
      }
    : splitInclusiveGst(membership.amount, gstPercent);

  return {
    paymentType: "MEMBERSHIP",
    paymentRecordId: membership.id,
    userId: membership.userId,
    memberName: membership.user.memberProfile?.fullName || membership.user.fullName || membership.user.email,
    businessName: membership.user.memberProfile?.businessName,
    email: membership.user.email,
    phone: membership.user.memberProfile?.phone,
    address: membership.user.memberProfile?.businessLocation || membership.user.memberProfile?.location,
    itemName: plan?.name || membership.membershipType,
    membershipType: plan?.name || membership.membershipType,
    billingCycle: plan?.billingCycle,
    joinedAt: membership.joinedAt,
    expiresAt: membership.expiresAt,
    ...pricing,
    paymentMethod,
    transactionId: membership.razorpayPaymentId || membership.paymentReference,
    paymentDate: membership.paidAt || new Date(),
  };
};

export const resendPaymentInvoiceEmail = async (invoiceId) => {
  const invoice = await prisma.paymentInvoice.findUnique({
    where: { id: invoiceId },
  });
  if (!invoice) return null;
  if (invoice.emailedAt) return invoice;

  if (invoice.paymentType === "MEMBERSHIP") {
    const data = await buildMembershipInvoiceData(invoice.paymentRecordId, invoice.paymentMethod);
    if (!data) return invoice;
    return sendAndMarkInvoice(invoice, data, invoice.createdAt);
  }

  if (invoice.paymentType === "EVENT") {
    const registration = await prisma.eventRegistration.findUnique({
      where: { id: invoice.paymentRecordId },
      include: {
        user: { include: { memberProfile: true } },
        event: true,
      },
    });
    if (!registration || registration.paymentStatus !== "PAID") return invoice;
    const pricing = splitInclusiveGst(registration.event.registrationAmount, GST_PERCENT);
    return sendAndMarkInvoice(invoice, {
      paymentType: "EVENT",
      paymentRecordId: registration.id,
      userId: registration.userId,
      memberName: registration.user.memberProfile?.fullName || registration.user.fullName || registration.user.email,
      businessName: registration.user.memberProfile?.businessName,
      email: registration.user.email,
      phone: registration.user.memberProfile?.phone,
      address: registration.user.memberProfile?.businessLocation || registration.user.memberProfile?.location,
      itemName: registration.event.title,
      membershipType: "Event Registration",
      ...pricing,
      paymentMethod: invoice.paymentMethod,
      transactionId: invoice.transactionId,
      paymentDate: invoice.createdAt,
    }, invoice.createdAt);
  }

  return invoice;
};

export const generateMembershipInvoice = async (membershipId, paymentMethod = "WhatsApp") => {
  const invoiceData = await buildMembershipInvoiceData(membershipId, paymentMethod);
  if (!invoiceData) return null;
  return saveAndSendInvoice(invoiceData);
};

export const generateEventInvoice = async (registrationId, paymentMethod = "WhatsApp") => {
  const registration = await prisma.eventRegistration.findUnique({
    where: { id: registrationId },
    include: {
      user: { include: { memberProfile: true } },
      event: true,
    },
  });
  if (!registration || registration.paymentStatus !== "PAID") return null;

  const pricing = splitInclusiveGst(registration.event.registrationAmount, GST_PERCENT);

  return saveAndSendInvoice({
    paymentType: "EVENT",
    paymentRecordId: registration.id,
    userId: registration.userId,
    memberName: registration.user.memberProfile?.fullName || registration.user.fullName || registration.user.email,
    businessName: registration.user.memberProfile?.businessName,
    email: registration.user.email,
    phone: registration.user.memberProfile?.phone,
    address: registration.user.memberProfile?.businessLocation || registration.user.memberProfile?.location,
    itemName: registration.event.title,
    membershipType: "Event Registration",
    ...pricing,
    paymentMethod,
    transactionId: registration.id,
    paymentDate: new Date(),
  });
};
