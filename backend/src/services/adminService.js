import { prisma } from "../config/prismaClient.js";
import bcrypt from "bcrypt";
import { AppError } from "../middleware/errorHandler.js";
import { supabaseStorage } from "../config/supabaseStorageClient.js";
import { generateMemberId } from "../utils/generateMemberId.js";
import { generateTemporaryPassword } from "../utils/generatePassword.js";
import { sendWelcomeCredentialsEmail } from "./emailService.js";
import { generateEventInvoice, generateMembershipInvoice } from "./invoiceService.js";
import { calculateExpiryDate } from "../utils/membershipDates.js";
import { notifyAdmins } from "./notificationService.js";
import { reactivationFields, suspensionFields } from "../utils/memberLifecycle.js";

const CERTIFICATES_BUCKET = "business-certificates";

export const getDashboardStats = async () => {
  const totalMembers = await prisma.membership.count({ where: { membershipStatus: "ACTIVE" } });

  const distinctLocations = await prisma.memberProfile.findMany({
    where: { location: { not: null } },
    select: { location: true },
    distinct: ["location"],
  });
  const totalHubs = distinctLocations.length;

  const upcomingEvents = await prisma.event.count({
    where: { status: "PUBLISHED", eventDate: { gte: new Date() } },
  });

  const membershipRevenue = await prisma.membership.aggregate({
    where: { paymentStatus: "PAID" },
    _sum: { amount: true },
  });
  const eventRegistrations = await prisma.eventRegistration.findMany({
    where: { paymentStatus: "PAID" },
    include: { event: { select: { registrationAmount: true } } },
  });
  const eventRevenue = eventRegistrations.reduce(
    (sum, r) => sum + Number(r.event.registrationAmount), 0
  );
  const totalRevenue = Number(membershipRevenue._sum.amount || 0) + eventRevenue;

  return { totalMembers, totalHubs, upcomingEvents, totalRevenue };
};

export const getMembersByHub = async () => {
  const profiles = await prisma.memberProfile.findMany({
    where: { location: { not: null }, user: { status: { not: "DELETED" }, membership: { deletedAt: null } } },
    select: { location: true },
  });

  const counts = {};
  profiles.forEach((p) => {
    counts[p.location] = (counts[p.location] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([hub, count]) => ({ hub, count }))
    .sort((a, b) => b.count - a.count);
};

export const getRecentlyJoinedMembers = async (limit = 5) => {
  const memberships = await prisma.membership.findMany({
    where: { membershipStatus: "ACTIVE" },
    orderBy: { joinedAt: "desc" },
    take: limit,
    include: { user: { include: { memberProfile: true } } },
  });

  return memberships.map((m) => ({
    userId: m.userId,
    fullName: m.user.memberProfile?.fullName,
    profilePhoto: m.user.memberProfile?.profilePhoto,
    businessName: m.user.memberProfile?.businessName,
    hub: m.user.memberProfile?.location,
    joinedAt: m.joinedAt,
  }));
};

export const getEventRegistrationSummary = async () => {
  const events = await prisma.event.findMany({
    where: { status: "PUBLISHED", eventDate: { gte: new Date() } },
    orderBy: { eventDate: "asc" },
    include: { _count: { select: { registrations: true } } },
  });

  return events.map((e) => ({
    id: e.id,
    title: e.title,
    date: e.eventDate,
    location: e.location,
    registeredCount: e._count.registrations,
    fee: Number(e.registrationAmount),
  }));
};

export const listAllMembers = async ({ search, hubId, status, membershipType }) => {
  const where = { memberProfile: { isNot: null }, status: { not: "DELETED" }, membership: { deletedAt: null } };

  if (search) {
    where.OR = [
      { memberProfile: { fullName: { contains: search, mode: "insensitive" } } },
      { memberProfile: { businessName: { contains: search, mode: "insensitive" } } },
    ];
  }
  if (hubId) where.memberProfile = { ...where.memberProfile, hubId };
  if (status) where.membership = { ...where.membership, membershipStatus: status };
  if (membershipType) where.membership = { ...where.membership, membershipType };

  const users = await prisma.user.findMany({
    where,
    include: { memberProfile: { include: { hub: true } }, membership: true },
    orderBy: { createdAt: "desc" },
  });

  return users.map((u) => ({
    userId: u.id,
    fullName: u.memberProfile?.fullName,
    profilePhoto: u.memberProfile?.profilePhoto,
    businessName: u.memberProfile?.businessName,
    hub: u.memberProfile?.hub?.name || "Not assigned",
    hubId: u.memberProfile?.hubId || null,
    membershipType: u.membership?.membershipType || null,
    membershipStatus: u.membership?.membershipStatus || null,
    joinedAt: u.membership?.joinedAt,
    expiresAt: u.membership?.expiresAt,
    suspendedAt: u.membership?.suspendedAt || null,
    autoDeleteAt: u.membership?.autoDeleteAt || null,
  }));
};

export const getMemberDetailForAdmin = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      memberProfile: { include: { hub: true } },
      membership: true,
      businessCertificates: true,
      eventRegistrations: { include: { event: true }, orderBy: { registeredAt: "desc" } },
    },
  });

  if (!user || !user.memberProfile || user.status === "DELETED" || user.membership?.deletedAt) throw new AppError("Member not found.", 404);

  const plan = user.membership
    ? await prisma.membershipPlan.findFirst({ where: { planCode: user.membership.membershipType } })
    : null;

  const paymentHistory = [];
  if (user.membership?.paymentStatus === "PAID") {
    paymentHistory.push({
      type: "Membership",
      item: user.membership.membershipType?.replace("_", " "),
      amount: Number(user.membership.amount),
      date: user.membership.paidAt,
      status: user.membership.paymentStatus,
    });
  }
  user.eventRegistrations
    .filter((r) => r.paymentStatus === "PAID")
    .forEach((r) => {
      paymentHistory.push({
        type: "Event",
        item: r.event.title,
        amount: Number(r.event.registrationAmount),
        date: r.registeredAt,
        status: r.paymentStatus,
      });
    });
  paymentHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

  const certificates = await Promise.all(
    user.businessCertificates.map(async (cert) => {
      const { data } = await supabaseStorage.storage
        .from(CERTIFICATES_BUCKET)
        .createSignedUrl(cert.filePath, 600);
      return { id: cert.id, fileName: cert.fileName, isVerified: cert.isVerified, signedUrl: data?.signedUrl || null };
    })
  );

  return {
    userId: user.id,
    fullName: user.memberProfile.fullName,
    profilePhoto: user.memberProfile.profilePhoto,
    location: user.memberProfile.location,
    hub: user.memberProfile.hub ? { id: user.memberProfile.hub.id, name: user.memberProfile.hub.name } : null,
    joinedAt: user.membership?.joinedAt,
    expiresAt: user.membership?.expiresAt,
    businessName: user.memberProfile.businessName,
    businessCategory: user.memberProfile.businessCategory,
    businessLocation: user.memberProfile.businessLocation,
    businessDescription: user.memberProfile.businessDescription,
    membershipType: user.membership?.membershipType,
    membershipStatus: user.membership?.membershipStatus,
    suspendedAt: user.membership?.suspendedAt || null,
    autoDeleteAt: user.membership?.autoDeleteAt || null,
    billingCycle: plan?.billingCycle || null,
    certificates,
    eventRegistrations: user.eventRegistrations.map((r) => ({
      id: r.id, eventTitle: r.event.title, eventDate: r.event.eventDate, hub: r.event.location,
    })),
    paymentHistory,
  };
};

export const assignMemberHub = async (userId, hubId) => {
  const profile = await prisma.memberProfile.findUnique({ where: { userId } });
  if (!profile) throw new AppError("Member profile not found.", 404);

  if (hubId) {
    const hub = await prisma.hub.findUnique({ where: { id: hubId } });
    if (!hub) throw new AppError("Hub not found.", 404);
  }

  return prisma.memberProfile.update({ where: { userId }, data: { hubId: hubId || null } });
};

export const listHubs = async () => {
  return prisma.hub.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
};

export const createMemberByAdmin = async (data, certificateFile) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError("A member with this email already exists.", 409);

  const plan = await prisma.membershipPlan.findFirst({
    where: { planCode: data.planCode, isActive: true },
  });
  if (!plan) throw new AppError("Selected membership plan does not exist.", 404);

  const hub = await prisma.hub.findUnique({ where: { id: data.hubId } });
  if (!hub) throw new AppError("Selected hub does not exist.", 404);

  const tempPassword = generateTemporaryPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 10);
  const memberId = await generateMemberId();
  const joinedAt = data.joinedAt ? new Date(data.joinedAt) : new Date();
  const expiresAt = calculateExpiryDate(joinedAt, plan.billingCycle);

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: { email: data.email, passwordHash, role: "MEMBER", status: "ACTIVE" },
    });

    await tx.memberProfile.create({
      data: {
        userId: newUser.id,
        fullName: data.fullName,
        phone: data.phone,
        location: data.location,
        hubId: data.hubId,
        businessName: data.businessName,
        businessType: data.businessType,
        businessCategory: data.businessCategory,
        businessDescription: data.businessDescription,
        productsServices: data.productsServices,
      },
    });

    await tx.membership.create({
      data: {
        userId: newUser.id,
        membershipType: plan.planCode,
        membershipStatus: "ACTIVE",
        amount: plan.amount,
        paymentStatus: "PAID",
        paymentReference: "ADMIN_MANUAL_ADD",
        memberId,
        joinedAt,
        expiresAt,
      },
    });

    return newUser;
  });

  if (certificateFile) {
    const safeName = certificateFile.originalname.replace(/[^a-zA-Z0-9.\-]/g, "_");
    const filePath = `${user.id}/${Date.now()}-${safeName}`;
    await supabaseStorage.storage
      .from(CERTIFICATES_BUCKET)
      .upload(filePath, certificateFile.buffer, { contentType: certificateFile.mimetype, upsert: true });

    await prisma.businessCertificate.create({
      data: {
        userId: user.id,
        filePath,
        fileName: certificateFile.originalname,
        fileSizeBytes: certificateFile.size,
        mimeType: certificateFile.mimetype,
      },
    });
  }

  await sendWelcomeCredentialsEmail({
    toEmail: data.email,
    fullName: data.fullName,
    memberId,
    tempPassword,
  });

  return { userId: user.id, memberId };
};

const slugifyPlanCode = (name) =>
  name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "");

export const listAllSubscriptions = async () => {
  return prisma.membershipPlan.findMany({ orderBy: { amount: "asc" } });
};

export const createSubscription = async (data) => {
  const gstPercent = Number(data.gstPercent ?? 18.0);
  const baseAmount = Number(Number(data.basePrice ?? (data.price / (1 + gstPercent / 100))).toFixed(2));
  const totalAmount = Number((baseAmount * (1 + gstPercent / 100)).toFixed(2));
  let planCode = slugifyPlanCode(data.name);

  const existing = await prisma.membershipPlan.findUnique({ where: { planCode } });
  if (existing) planCode = `${planCode}_${Date.now()}`;

  return prisma.membershipPlan.create({
    data: {
      planCode,
      name: data.name,
      description: data.description,
      baseAmount,
      gstPercent,
      amount: totalAmount,
      billingCycle: data.billingCycle,
      benefits: data.benefits,
      isActive: data.isActive,
      activeFrom: data.activeFrom ? new Date(data.activeFrom) : null,
      activeUntil: data.activeUntil ? new Date(data.activeUntil) : null,
    },
  });
};

export const updateSubscription = async (id, data) => {
  const plan = await prisma.membershipPlan.findUnique({ where: { id } });
  if (!plan) throw new AppError("Subscription not found.", 404);

  const gstPercent = Number(data.gstPercent ?? plan.gstPercent);
  const baseAmount = Number(Number(data.basePrice ?? (data.price / (1 + gstPercent / 100))).toFixed(2));
  const totalAmount = Number((baseAmount * (1 + gstPercent / 100)).toFixed(2));

  return prisma.membershipPlan.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      baseAmount,
      gstPercent,
      amount: totalAmount,
      billingCycle: data.billingCycle,
      benefits: data.benefits,
      isActive: data.isActive,
      activeFrom: data.activeFrom ? new Date(data.activeFrom) : null,
      activeUntil: data.activeUntil ? new Date(data.activeUntil) : null,
    },
  });
};

export const toggleSubscriptionStatus = async (id) => {
  const plan = await prisma.membershipPlan.findUnique({ where: { id } });
  if (!plan) throw new AppError("Subscription not found.", 404);
  return prisma.membershipPlan.update({ where: { id }, data: { isActive: !plan.isActive } });
};
export const listMembershipPayments = async () => {
  const memberships = await prisma.membership.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { include: { memberProfile: true } } },
  });

  const plans = await prisma.membershipPlan.findMany();
  const planMap = Object.fromEntries(plans.map((p) => [p.planCode, p.name]));
  const invoices = await prisma.paymentInvoice.findMany({
    where: {
      paymentType: "MEMBERSHIP",
      paymentRecordId: { in: memberships.map((membership) => membership.id) },
    },
    select: {
      invoiceNumber: true,
      paymentRecordId: true,
      emailedAt: true,
    },
  });
  const invoiceMap = new Map(invoices.map((invoice) => [invoice.paymentRecordId, invoice]));

  return memberships.map((m) => ({
    id: m.id,
    userId: m.userId,
    memberName: m.user.memberProfile?.fullName || "-",
    packageName: planMap[m.membershipType] || m.membershipType,
    amount: Number(m.amount),
    date: m.paidAt || m.createdAt,
    method: m.razorpayPaymentId ? "Razorpay" : "WhatsApp",
    status: m.paymentStatus, // PENDING | PAID | FAILED | REFUNDED
    invoiceNumber: invoiceMap.get(m.id)?.invoiceNumber || null,
    invoiceEmailedAt: invoiceMap.get(m.id)?.emailedAt || null,
    invoiceEmailStatus: m.paymentStatus === "PAID"
      ? invoiceMap.get(m.id)?.emailedAt
        ? "SENT"
        : "PENDING"
      : "NOT_READY",
  }));
};

const getActiveMember = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { membership: true } });
  if (!user?.membership || user.status === "DELETED" || user.membership.deletedAt) throw new AppError("Member not found.", 404);
  return user;
};

export const updateMember = async (userId, data) => {
  const user = await getActiveMember(userId);
  if (data.hubId) {
    const hub = await prisma.hub.findUnique({ where: { id: data.hubId } });
    if (!hub) throw new AppError("Hub not found.", 404);
  }
  if (data.membershipStatus === "SUSPENDED") throw new AppError("Use the Suspend action to suspend a member.", 400);
  return prisma.$transaction(async (tx) => {
    await tx.memberProfile.update({ where: { userId }, data: { fullName: data.fullName, businessName: data.businessName, hubId: data.hubId ?? null } });
    const status = data.membershipStatus && data.membershipStatus !== user.membership.membershipStatus
      ? data.membershipStatus : undefined;
    if (status) await tx.user.update({ where: { id: userId }, data: { status: status === "ACTIVE" ? "ACTIVE" : "PENDING" } });
    return tx.membership.update({ where: { userId }, data: { membershipType: data.membershipType, ...(status ? { membershipStatus: status } : {}) } });
  });
};

export const suspendMember = async (userId, now = new Date()) => {
  const user = await getActiveMember(userId);
  if (user.membership.membershipStatus === "SUSPENDED") throw new AppError("Member is already suspended.", 400);
  return prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { status: "SUSPENDED" } });
    return tx.membership.update({ where: { userId }, data: suspensionFields(user.membership.membershipStatus, now) });
  });
};

export const reactivateMember = async (userId) => {
  const user = await getActiveMember(userId);
  if (user.membership.membershipStatus !== "SUSPENDED") throw new AppError("Only suspended members can be reactivated.", 400);
  const fields = reactivationFields(user.membership.previousStatus);
  return prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { status: fields.membershipStatus === "ACTIVE" ? "ACTIVE" : "PENDING" } });
    return tx.membership.update({ where: { userId }, data: fields });
  });
};

export const softDeleteMember = async (userId, now = new Date()) => {
  await getActiveMember(userId);
  return prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { status: "DELETED" } });
    return tx.membership.update({ where: { userId }, data: {
      membershipStatus: "DELETED", deletedAt: now, autoDeleteAt: null,
    } });
  });
};

export const autoDeleteExpiredSuspensions = async (now = new Date()) => {
  const expired = await prisma.membership.findMany({
    where: { membershipStatus: "SUSPENDED", deletedAt: null, autoDeleteAt: { lte: now } },
    select: { userId: true },
  });
  if (!expired.length) return { count: 0 };
  await prisma.$transaction([
    prisma.membership.updateMany({ where: { userId: { in: expired.map((item) => item.userId) } }, data: { membershipStatus: "DELETED", deletedAt: now, autoDeleteAt: null } }),
    prisma.user.updateMany({ where: { id: { in: expired.map((item) => item.userId) } }, data: { status: "DELETED" } }),
  ]);
  await notifyAdmins({ type: "MEMBER_AUTO_DELETED", title: "Suspended members deleted", message: `${expired.length} suspended member${expired.length === 1 ? " was" : "s were"} soft-deleted after six months.` });
  return { count: expired.length };
};

export const listEventPayments = async () => {
  const registrations = await prisma.eventRegistration.findMany({
    orderBy: { registeredAt: "desc" },
    include: { user: { include: { memberProfile: true } }, event: true },
  });

  return registrations.map((r) => ({
    id: r.id,
    userId: r.userId,
    memberName: r.user.memberProfile?.fullName || "-",
    eventTitle: r.event.title,
    amount: Number(r.event.registrationAmount),
    date: r.registeredAt,
    method: "WhatsApp", // no other payment path exists for events yet
    status: r.paymentStatus, // PENDING | PAID | FAILED
  }));
};

export const verifyMembershipPayment = async (membershipId) => {
  const membership = await prisma.membership.findUnique({ where: { id: membershipId } });
  if (!membership) throw new AppError("Payment record not found.", 404);
  if (membership.paymentStatus !== "PENDING") throw new AppError("This payment is not pending.", 400);

  const plan = await prisma.membershipPlan.findFirst({
    where: { planCode: membership.membershipType },
  });
  const now = new Date();
  const memberId = membership.memberId || await generateMemberId();
  const joinedAt = membership.joinedAt || now;
  const expiresAt = calculateExpiryDate(joinedAt, plan?.billingCycle);

  const updated = await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: membership.userId },
      data: { status: "ACTIVE" },
    });

    return tx.membership.update({
      where: { id: membershipId },
      data: {
        memberId,
        membershipStatus: "ACTIVE",
        paymentStatus: "PAID",
        paymentReference: `ADMIN_VERIFIED_${Date.now()}`,
        paidAt: now,
        joinedAt,
        expiresAt,
      },
    });
  });

  await generateMembershipInvoice(updated.id, "WhatsApp");
  return updated;
};

export const updateMemberJoinedDate = async (userId, newJoinedAt) => {
  const membership = await prisma.membership.findUnique({ where: { userId } });
  if (!membership) throw new AppError("Membership not found.", 404);
  const plan = await prisma.membershipPlan.findFirst({ where: { planCode: membership.membershipType } });
  const expiresAt = calculateExpiryDate(new Date(newJoinedAt), plan?.billingCycle);
  return prisma.membership.update({
    where: { userId },
    data: { joinedAt: new Date(newJoinedAt), expiresAt },
  });
};

export const rejectMembershipPayment = async (membershipId) => {
  const membership = await prisma.membership.findUnique({ where: { id: membershipId } });
  if (!membership) throw new AppError("Payment record not found.", 404);
  return prisma.membership.update({ where: { id: membershipId }, data: { paymentStatus: "FAILED" } });
};

export const verifyEventPayment = async (registrationId) => {
  const reg = await prisma.eventRegistration.findUnique({ where: { id: registrationId } });
  if (!reg) throw new AppError("Registration not found.", 404);
  const updated = await prisma.eventRegistration.update({
    where: { id: registrationId },
    data: { paymentStatus: "PAID", registrationStatus: "CONFIRMED" },
  });
  await generateEventInvoice(updated.id, "WhatsApp");
  return updated;
};

export const rejectEventPayment = async (registrationId) => {
  const reg = await prisma.eventRegistration.findUnique({ where: { id: registrationId } });
  if (!reg) throw new AppError("Registration not found.", 404);
  return prisma.eventRegistration.update({
    where: { id: registrationId },
    data: { paymentStatus: "FAILED", registrationStatus: "CANCELLED" },
  });
};

export const getAdminProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, fullName: true, profilePhoto: true, role: true },
  });
  if (!user) throw new AppError("User not found.", 404);
  return user;
};

export const updateAdminProfile = async (userId, data, profilePhotoFile) => {
  const existing = await prisma.user.findFirst({ where: { email: data.email, NOT: { id: userId } } });
  if (existing) throw new AppError("That email is already in use.", 409);

  const profilePhoto = profilePhotoFile
    ? `data:${profilePhotoFile.mimetype};base64,${profilePhotoFile.buffer.toString("base64")}`
    : undefined;

  return prisma.user.update({
    where: { id: userId },
    data: { fullName: data.fullName, email: data.email, ...(profilePhoto ? { profilePhoto } : {}) },
    select: { id: true, email: true, fullName: true, profilePhoto: true, role: true },
  });
};

export const changeAdminPassword = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.passwordHash) throw new AppError("User not found.", 404);

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) throw new AppError("Current password is incorrect.", 401);

  const newHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } });
  return { success: true };
};
