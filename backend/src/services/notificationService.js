import { prisma } from "../config/prismaClient.js";

const RECENT_LIMIT = 8;

export const getMyNotifications = async (userId, limit = 20) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: Number(limit) || 20,
  });
};

export const getUnreadCount = async (userId) => {
  return prisma.notification.count({ where: { userId, isRead: false } });
};

export const listMyNotifications = async (userId, limit = RECENT_LIMIT) => {
  const [items, unreadCount] = await Promise.all([
    getMyNotifications(userId, limit),
    getUnreadCount(userId),
  ]);

  return { items, unreadCount };
};

export const markAsRead = async (notificationId, userId) => {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });
  if (!notification) return { success: false };

  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
  return { success: true };
};

export const markAllAsRead = async (userId) => {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  return { success: true };
};

export const markMyNotificationsRead = markAllAsRead;

export const notifyUser = async ({ userId, type, title, message, relatedUserId, link }) => {
  return prisma.notification.create({
    data: { userId, type, title, message, relatedUserId, link },
  });
};

export const notifyAdmins = async ({ type, title, message, relatedUserId, link }) => {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", status: "ACTIVE" },
    select: { id: true },
  });
  if (!admins.length) return { count: 0 };

  const result = await prisma.notification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      audience: "ADMIN",
      type,
      title,
      message,
      relatedUserId,
      link,
    })),
  });
  return { count: result.count };
};

export const notifyActiveMembersAboutEvent = async (event) => {
  if (event.status && event.status !== "PUBLISHED") return { count: 0 };

  const members = await prisma.user.findMany({
    where: {
      role: "MEMBER",
      status: "ACTIVE",
      memberProfile: { isNot: null },
    },
    select: { id: true },
  });
  if (!members.length) return { count: 0 };

  const result = await prisma.notification.createMany({
    data: members.map((member) => ({
      userId: member.id,
      audience: "MEMBER",
      type: "EVENT_PUBLISHED",
      title: "New event published",
      message: `${event.title} is now open for registration.`,
      link: `/events/${event.id}`,
    })),
  });
  return { count: result.count };
};
