import { prisma } from "../config/prismaClient.js";
import { AppError } from "../middleware/errorHandler.js";

export const getMyProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { memberProfile: true, membership: true },
  });

  if (!user) throw new AppError("User not found.", 404);

  return {
    fullName: user.memberProfile?.fullName || "",
    location: user.memberProfile?.location || "",
    profilePhoto: user.memberProfile?.profilePhoto || null,
    email: user.email,
    memberId: user.membership?.memberId || null,
    membershipType: user.membership?.membershipType || null,
    membershipStatus: user.membership?.membershipStatus || null,
    joinedAt: user.membership?.joinedAt || null,
  };
};

export const getMyStats = async (userId) => {
  const membership = await prisma.membership.findUnique({ where: { userId } });
  const eventsJoined = await prisma.eventRegistration.count({ where: { userId } });

  // TODO: referralsGiven/Received require a `referrals` table that doesn't
  // exist yet. Stubbed until that table is built.
  return {
    membershipStatus: membership?.membershipStatus || "PENDING_PAYMENT",
    eventsJoined,
    referralsGiven: 0,
    referralsReceived: 0,
  };
};

export const getMyUpcomingEvents = async () => {
  // TODO: requires `events` + `event_registrations` tables (Phase 7 of the
  // original architecture). Returning mock data until those exist.
  return [
    {
      id: "mock-1",
      title: "Sustainable Business Showcase",
      imageUrl: null,
      tags: ["Business", "Community", "Networking"],
      date: "20 October 2026",
      time: "11:00 AM",
      location: "Pondicherry",
    },
    {
      id: "mock-2",
      title: "Handloom & Craft Exhibition",
      imageUrl: null,
      tags: ["Community", "Networking"],
      date: "15 November 2026",
      time: "10:00 AM",
      location: "Madurai",
    },
  ];
};
export const listMembers = async ({ search, category, location }) => {
  const where = {
    memberProfile: { isNot: null },
    membership: { membershipStatus: "ACTIVE" },
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

  const users = await prisma.user.findMany({
    where,
    include: { memberProfile: true, businessCertificates: true },
    orderBy: { createdAt: "desc" },
  });

  return users.map((u) => ({
    userId: u.id,
    fullName: u.memberProfile.fullName,
    profilePhoto: u.memberProfile.profilePhoto,
    businessName: u.memberProfile.businessName,
    businessCategory: u.memberProfile.businessCategory,
    location: u.memberProfile.location,
    isVerified: u.businessCertificates.some((c) => c.isVerified),
  }));
};

export const getMemberDetail = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { memberProfile: true, membership: true, businessCertificates: true },
  });

  if (!user || !user.memberProfile) throw new AppError("Member not found.", 404);

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
    phone: user.memberProfile.phone,
    location: user.memberProfile.location,
    profilePhoto: user.memberProfile.profilePhoto,
    businessName: user.memberProfile.businessName,
    businessCategory: user.memberProfile.businessCategory,
    businessLocation: user.memberProfile.businessLocation,
    businessDescription: user.memberProfile.businessDescription,
    productsServices: user.memberProfile.productsServices,
    membershipType: user.membership?.membershipType,
    membershipStatus: user.membership?.membershipStatus,
    billingCycle: plan?.billingCycle || null,
    joinedAt: user.membership?.joinedAt,
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

  return prisma.memberProfile.update({ where: { userId }, data: updateData });
};
