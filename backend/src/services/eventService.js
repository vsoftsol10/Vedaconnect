import { prisma } from "../config/prismaClient.js";
import { AppError } from "../middleware/errorHandler.js";

export const getUpcomingEvents = async () => {
  return prisma.event.findMany({
    where: { status: "PUBLISHED", eventDate: { gte: new Date() } },
    orderBy: { eventDate: "asc" },
  });
};

export const getPastEvents = async () => {
  return prisma.event.findMany({
    where: { status: "PUBLISHED", eventDate: { lt: new Date() } },
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

export const getEventDetail = async (eventId) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError("Event not found.", 404);
  return event;
};

export const registerForEvent = async ({ userId, eventId }) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError("Event not found.", 404);

  const existing = await prisma.eventRegistration.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
  if (existing) throw new AppError("You're already registered for this event.", 409);

  return prisma.eventRegistration.create({
    data: { userId, eventId, registrationStatus: "REGISTERED", paymentStatus: "PENDING" },
  });
};