import { prisma } from "../config/prismaClient.js";
import { AppError } from "../middleware/errorHandler.js";
import { notifyAdmins } from "./notificationService.js";

const eventVisibilityWhere = async (userId) => {
  const profile = await prisma.memberProfile.findUnique({ where: { userId }, select: { hubId: true } });
  return profile?.hubId ? { OR: [{ hubId: null }, { hubId: profile.hubId }] } : { hubId: null };
};

export const getUpcomingEvents = async (userId) => {
  return prisma.event.findMany({
    where: { status: "PUBLISHED", eventDate: { gte: new Date() }, ...(await eventVisibilityWhere(userId)) },
    orderBy: { eventDate: "asc" },
  });
};

export const getPastEvents = async (userId) => {
  return prisma.event.findMany({
    where: { status: "PUBLISHED", eventDate: { lt: new Date() }, ...(await eventVisibilityWhere(userId)) },
    orderBy: { eventDate: "desc" },
  });
};

export const getMyEvents = async (userId) => {
  const registrations = await prisma.eventRegistration.findMany({
    where: { userId },
    include: { event: true },
    orderBy: { event: { eventDate: "asc" } },
  });
  return registrations.map((r) => ({
    ...r.event,
    registrationStatus: r.registrationStatus,
    paymentStatus: r.paymentStatus,
    attendanceStatus: r.attendanceStatus,
  }));
};

export const getEventDetail = async (eventId, userId) => {
  const event = await prisma.event.findFirst({ where: { id: eventId, ...(await eventVisibilityWhere(userId)) } });
  if (!event) throw new AppError("Event not found.", 404);
  return event;
};

export const registerForEvent = async ({ userId, eventId }) => {
  const event = await prisma.event.findFirst({ where: { id: eventId, ...(await eventVisibilityWhere(userId)) } });
  if (!event) throw new AppError("Event not found.", 404);
  if (event.eventType === "NO_FEE") {
    throw new AppError("Weekly meetings are informational and do not require registration.", 400);
  }

  const existing = await prisma.eventRegistration.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
  if (existing) throw new AppError("You're already registered for this event.", 409);

  const registration = await prisma.eventRegistration.create({
    data: { userId, eventId, registrationStatus: "REGISTERED", paymentStatus: "PENDING" },
    include: { user: { include: { memberProfile: true } }, event: true },
  });

  try {
    await notifyAdmins({
      type: "EVENT_PAYMENT_SUBMITTED",
      title: "Event payment submitted",
      message: `${registration.user.memberProfile?.fullName || registration.user.email} submitted payment for ${registration.event.title}.`,
      link: "/admin/payment-history",
    });
  } catch (error) {
    console.error("[EVENT_PAYMENT_NOTIFICATION_FAILED]", {
      message: error?.message,
      registrationId: registration.id,
    });
  }

  return registration;
};
