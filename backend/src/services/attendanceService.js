import { prisma } from "../config/prismaClient.js";
import { getCurrentWeekStart } from "../utils/weekUtils.js";

const setAttendance = async (userId, status) => {
  const now = new Date();
  const weekStart = getCurrentWeekStart();

  return prisma.meetingAttendance.upsert({
    where: { userId_weekStart: { userId, weekStart } },
    update: { status, respondedAt: now },
    create: { userId, weekStart, status, respondedAt: now },
  });
};

export const confirmAttendance = (userId) => setAttendance(userId, "CONFIRMED");

export const declineAttendance = (userId) => setAttendance(userId, "DECLINED");

export const getMyAttendanceStatus = async (userId) => {
  const weekStart = getCurrentWeekStart();
  const attendance = await prisma.meetingAttendance.findUnique({
    where: { userId_weekStart: { userId, weekStart } },
  });

  return {
    weekStart,
    status: attendance?.status || "PENDING",
    respondedAt: attendance?.respondedAt || null,
  };
};

export const getWeeklyAttendanceList = async (weekStart = getCurrentWeekStart()) => {
  const week = new Date(weekStart);
  const [members, attendanceRows] = await Promise.all([
    prisma.user.findMany({
      where: { role: "MEMBER", memberProfile: { isNot: null } },
      include: { memberProfile: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.meetingAttendance.findMany({ where: { weekStart: week } }),
  ]);

  const attendanceByUser = new Map(attendanceRows.map((row) => [row.userId, row]));
  return members.map((member) => {
    const attendance = attendanceByUser.get(member.id);
    return {
      userId: member.id,
      fullName: member.memberProfile?.fullName || member.email,
      profilePhoto: member.memberProfile?.profilePhoto,
      businessName: member.memberProfile?.businessName,
      weekStart: week,
      status: attendance?.status || "PENDING",
      respondedAt: attendance?.respondedAt || null,
    };
  });
};
