import { prisma } from "../config/prismaClient.js";
import { AppError } from "../middleware/errorHandler.js";

export async function listHubs() {
  const hubs = await prisma.hub.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { memberProfiles: true } },
    },
  });

  return hubs.map((hub) => ({
    id: hub.id,
    name: hub.name,
    location: hub.location,
    description: hub.description,
    coordinatorName: hub.coordinatorName,
    isActive: hub.isActive,
    memberCount: hub._count.memberProfiles,
    upcomingEventTitle: null,
  }));
}

export async function getHubById(id) {
  const hub = await prisma.hub.findUnique({
    where: { id },
    include: {
      memberProfiles: { include: { user: true } },
      _count: { select: { memberProfiles: true } },
    },
  });

  if (!hub) {
    throw new AppError("Hub not found", 404);
  }

  return {
    id: hub.id,
    name: hub.name,
    location: hub.location,
    description: hub.description,
    coordinatorName: hub.coordinatorName,
    isActive: hub.isActive,
    memberCount: hub._count.memberProfiles,
    members: hub.memberProfiles.map((mp) => ({
      id: mp.userId,
      fullName: mp.fullName,
      businessName: mp.businessName,
      profilePhoto: mp.profilePhoto,
    })),
    upcomingEvents: [],
    pastEvents: [],
  };
}

export async function createHub(data) {
  const existing = await prisma.hub.findFirst({ where: { name: data.name } });
  if (existing) {
    throw new AppError("A hub with this name already exists", 409);
  }
  return prisma.hub.create({ data });
}

export async function updateHub(id, data) {
  const hub = await prisma.hub.findUnique({ where: { id } });
  if (!hub) {
    throw new AppError("Hub not found", 404);
  }
  return prisma.hub.update({ where: { id }, data });
}

export async function deactivateHub(id) {
  const hub = await prisma.hub.findUnique({ where: { id } });
  if (!hub) {
    throw new AppError("Hub not found", 404);
  }
  return prisma.hub.update({ where: { id }, data: { isActive: false } });
}
