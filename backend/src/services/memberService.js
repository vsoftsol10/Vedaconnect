import { prisma } from "../config/prismaClient.js";
import { AppError } from "../middleware/errorHandler.js";

const normalizePhone = (value) => {
  const digits = value.replace(/\D/g, "");
  return digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
};

export const getMyProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { memberProfile: { include: { hub: { select: { id: true, name: true } } } }, membership: true },
  });

  if (!user) throw new AppError("User not found.", 404);

  return {
    fullName: user.memberProfile?.fullName || "",
    hub: user.memberProfile?.hub || null,
    location: user.memberProfile?.location || "",
    profilePhoto: user.memberProfile?.profilePhoto || null,
    email: user.email,
    memberId: user.membership?.memberId || null,
    membershipType: user.membership?.membershipType || null,
    membershipStatus: user.membership?.membershipStatus || null,
    joinedAt: user.membership?.joinedAt || null,
    expiresAt: user.membership?.expiresAt || null,
  };
};

export const getMyStats = async (userId) => {
  const [membership, eventsJoined, referralsGiven, businessReceived] = await Promise.all([
    prisma.membership.findUnique({ where: { userId } }),
    prisma.eventRegistration.count({ where: { userId } }),
    prisma.referralGiven.count({ where: { giverId: userId } }),
    prisma.businessReceived.count({ where: { receiverId: userId } }),
  ]);

  return {
    membershipStatus: membership?.membershipStatus || "PENDING_PAYMENT",
    eventsJoined,
    referralsGiven,
    referralsReceived: businessReceived,
  };
};

export const getMyUpcomingEvents = async () => {
  const events = await prisma.event.findMany({
    where: { status: "PUBLISHED", eventDate: { gte: new Date() } },
    orderBy: { eventDate: "asc" },
    take: 4,
    select: {
      id: true,
      title: true,
      imageUrl: true,
      tags: true,
      eventDate: true,
      startTime: true,
      location: true,
    },
  });

  return events.map((event) => ({
    ...event,
    tags: Array.isArray(event.tags) ? event.tags : [],
    date: event.eventDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    time: event.startTime || "Time to be announced",
  }));
};
export const listMembers = async ({ search, category, location, membershipStatus, membershipTier }) => {
  const where = {
    memberProfile: { isNot: null },
    status: { not: "DELETED" },
    membership: { deletedAt: null },
  };

  if (search) {
    where.OR = [
      { memberProfile: { fullName: { contains: search, mode: "insensitive" } } },
      { memberProfile: { businessName: { contains: search, mode: "insensitive" } } },
    ];
  }
  if (category) {
    where.memberProfile = { ...where.memberProfile, businessCategory: category };
  }
  if (location) {
    where.memberProfile = { ...where.memberProfile, location: { contains: location, mode: "insensitive" } };
  }
  if (membershipStatus) {
    where.membership = { ...where.membership, membershipStatus };
  }
  if (membershipTier) where.membershipTier = membershipTier;

  const users = await prisma.user.findMany({
    where,
    include: { memberProfile: { include: { hub: { select: { id: true, name: true } } } }, membership: true, businessCertificates: true },
    orderBy: { createdAt: "desc" },
  });

  return users.map((u) => ({
    userId: u.id,
    fullName: u.memberProfile.fullName,
    profilePhoto: u.memberProfile.profilePhoto,
    businessName: u.memberProfile.businessName,
    businessCategory: u.memberProfile.businessCategory,
    businessType: u.memberProfile.businessType,
    location: u.memberProfile.location,
    hub: u.memberProfile.hub?.name || null,
    membershipStatus: u.membership?.membershipStatus || "PENDING_PAYMENT",
    membershipTier: u.membershipTier || null,
    isVerified: u.businessCertificates.some((c) => c.isVerified),
  }));
};

export const getMemberDetail = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { memberProfile: true, membership: true, businessCertificates: true },
  });

  if (!user || !user.memberProfile || user.status === "DELETED" || user.membership?.deletedAt) throw new AppError("Member not found.", 404);

  return {
    userId: user.id,
    fullName: user.memberProfile.fullName,
    profilePhoto: user.memberProfile.profilePhoto,
    location: user.memberProfile.location,
    businessName: user.memberProfile.businessName,
    businessCategory: user.memberProfile.businessCategory,
    businessLocation: user.memberProfile.businessLocation,
    businessDescription: user.memberProfile.businessDescription,
    productsServices: user.memberProfile.productsServices,
    membershipType: user.membership?.membershipType,
    certificates: user.businessCertificates.map((c) => ({
      id: c.id,
      fileName: c.fileName,
      isVerified: c.isVerified,
    })),
    isVerified: user.businessCertificates.some((c) => c.isVerified),
  };
};
import { supabaseStorage } from "../config/supabaseStorageClient.js";

const CERTIFICATES_BUCKET = "business-certificates";

export const getMyFullProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { memberProfile: true, membership: true, businessCertificates: true },
  });

  if (!user || !user.memberProfile) throw new AppError("Profile not found.", 404);

  const plan = user.membership
    ? await prisma.membershipPlan.findUnique({ where: { planCode: user.membership.membershipType } })
    : null;

  // Private bucket - generate a temporary signed link per certificate, valid 10 minutes
  const certificates = await Promise.all(
    user.businessCertificates.map(async (cert) => {
      const { data } = await supabaseStorage.storage
        .from(CERTIFICATES_BUCKET)
        .createSignedUrl(cert.filePath, 600);
      return {
        id: cert.id,
        fileName: cert.fileName,
        isVerified: cert.isVerified,
        signedUrl: data?.signedUrl || null,
      };
    })
  );

  return {
    fullName: user.memberProfile.fullName,
    email: user.email,
    registeredAt: user.createdAt,
    phone: user.memberProfile.phone,
    location: user.memberProfile.location,
    profilePhoto: user.memberProfile.profilePhoto,
    businessName: user.memberProfile.businessName,
    businessCategory: user.memberProfile.businessCategory,
    businessLocation: user.memberProfile.businessLocation,
    businessDescription: user.memberProfile.businessDescription,
    productsServices: user.memberProfile.productsServices,
    memberId: user.membership?.memberId || null,
    membershipType: user.membership?.membershipType,
    membershipTier: user.membershipTier || null,
    membershipStatus: user.membership?.membershipStatus,
    membershipPlanName: plan?.name || null,
    membershipAmount: user.membership?.amount ?? null,
    membershipBaseAmount: plan?.baseAmount ?? null,
    membershipGstPercent: plan?.gstPercent ?? null,
    paymentStatus: user.membership?.paymentStatus || null,
    paymentReference: user.membership?.paymentReference || null,
    paidAt: user.membership?.paidAt || null,
    billingCycle: plan?.billingCycle || null,
    joinedAt: user.membership?.joinedAt,
    expiresAt: user.membership?.expiresAt || null,
    certificates,
  };
};

export const updateMyProfile = async (userId, data) => {
  const allowedFields = [
    "fullName", "phone", "location",
    "businessName", "businessCategory", "businessLocation",
    "businessDescription", "productsServices",
  ];

  const updateData = {};
  for (const key of allowedFields) {
    if (data[key] !== undefined) updateData[key] = data[key];
  }

  if (updateData.phone !== undefined) {
    const normalizedPhone = normalizePhone(String(updateData.phone).trim());
    if (normalizedPhone.length !== 10) {
      throw new AppError("Phone number must be exactly 10 digits", 400);
    }
    updateData.phone = normalizedPhone;
  }

  return prisma.memberProfile.update({ where: { userId }, data: updateData });
};
