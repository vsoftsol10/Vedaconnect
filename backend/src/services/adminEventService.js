import { prisma } from "../config/prismaClient.js";
import { supabaseStorage } from "../config/supabaseStorageClient.js";
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
    ...eventData
  } = input;

  return {
    ...eventData,
    registrationAmount: isPaid ? eventData.registrationAmount : 0,
  };
}

const POSTERS_BUCKET = "event-posters";

const sanitizePosterFilename = (filename) => {
  const normalizedName = filename.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  const extensionIndex = normalizedName.lastIndexOf(".");
  const rawBaseName = extensionIndex > 0 ? normalizedName.slice(0, extensionIndex) : normalizedName;
  const rawExtension = extensionIndex > 0 ? normalizedName.slice(extensionIndex) : "";
  const safeBaseName = rawBaseName
    .replace(/[^A-Za-z0-9.-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^[._-]+|[._-]+$/g, "") || "poster";
  const safeExtension = rawExtension.replace(/[^A-Za-z0-9.]/g, "");
  return `${safeBaseName}${safeExtension}`;
};

const uploadPoster = async (eventId, poster) => {
  const filePath = `${eventId}/${Date.now()}-${sanitizePosterFilename(poster.originalname)}`;
  const { error } = await supabaseStorage.storage
    .from(POSTERS_BUCKET)
    .upload(filePath, poster.buffer, { contentType: poster.mimetype, upsert: false });
  if (error) throw new AppError(`Could not upload event poster: ${error.message}`, 500);
  return supabaseStorage.storage.from(POSTERS_BUCKET).getPublicUrl(filePath).data.publicUrl;
};

export async function createEvent(input, poster) {
  let event = await prisma.event.create({ data: buildEventData(input) });
  if (poster) {
    const imageUrl = await uploadPoster(event.id, poster);
    event = await prisma.event.update({ where: { id: event.id }, data: { imageUrl } });
  }
  await notifyActiveMembersAboutEvent(event);
  return event;
}

export async function updateEvent(id, input, poster) {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) {
    throw new AppError("Event not found", 404);
  }
  const data = buildEventData(input);
  if (poster) data.imageUrl = await uploadPoster(id, poster);
  return prisma.event.update({ where: { id }, data });
}

export async function deleteEvent(id) {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) {
    throw new AppError("Event not found", 404);
  }
  await prisma.event.delete({ where: { id } });
}
