import { prisma } from "../config/prismaClient.js";
import { AppError } from "../middleware/errorHandler.js";
import { notifyActiveMembersAboutEvent } from "./notificationService.js";

function isPastEvent(eventDate) {
  return new Date(eventDate) < new Date();
}

function toAdminEventListItem(event) {
  return {
    id: event.id,
    title: event.title,
    eventDate: event.eventDate,
    location: event.location,
    hubId: null,
    hubName: null,
    registrationCount: event._count?.registrations ?? 0,
    maxMembers: null,
    registrationAmount: Number(event.registrationAmount),
    isPast: isPastEvent(event.eventDate),
  };
}

export async function listEvents() {
  const events = await prisma.event.findMany({
    orderBy: { eventDate: "desc" },
    include: {
      _count: { select: { registrations: true } },
    },
  });

  return events.map(toAdminEventListItem);
}

export async function getEventById(id) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      registrations: {
        include: { user: { include: { memberProfile: true } } },
      },
    },
  });

  if (!event) {
    throw new AppError("Event not found", 404);
  }

  return {
    ...event,
    registrationAmount: Number(event.registrationAmount),
    hubId: null,
    hubName: null,
    isPast: isPastEvent(event.eventDate),
    registrationCount: event.registrations.length,
    maxMembers: null,
    schedule: [],
    registrationDeadline: event.eventDate,
    attendees: event.registrations.map((registration) => ({
      userId: registration.userId,
      fullName: registration.user.memberProfile?.fullName || registration.user.email,
      businessName: registration.user.memberProfile?.businessName || null,
      profilePhoto: registration.user.memberProfile?.profilePhoto || null,
      registrationStatus: registration.registrationStatus,
      paymentStatus: registration.paymentStatus,
    })),
  };
}

function buildEventData(input) {
  const {
    isPaid,
    hubId,
    schedule,
    registrationDeadline,
    maxMembers,
    ...eventData
  } = input;

  return {
    ...eventData,
    registrationAmount: isPaid ? eventData.registrationAmount : 0,
  };
}

export async function createEvent(input) {
  const event = await prisma.event.create({ data: buildEventData(input) });
  await notifyActiveMembersAboutEvent(event);
  return event;
}

export async function updateEvent(id, input) {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) {
    throw new AppError("Event not found", 404);
  }
  return prisma.event.update({ where: { id }, data: buildEventData(input) });
}

export async function deleteEvent(id) {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) {
    throw new AppError("Event not found", 404);
  }
  await prisma.event.delete({ where: { id } });
}
