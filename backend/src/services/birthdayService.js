import { prisma } from "../config/prismaClient.js";

const parts = (date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date).reduce((out, item) => ({ ...out, [item.type]: item.value }), {});
const birthdayForYear = (dob, year) => { const p = parts(dob); const isLeapDay = p.month === "02" && p.day === "29"; const leapYear = new Date(Date.UTC(year, 1, 29)).getUTCMonth() === 1; return new Date(Date.UTC(year, Number(p.month) - 1, isLeapDay && !leapYear ? 28 : Number(p.day))); };
const dateKey = (date) => `${parts(date).year}-${parts(date).month}-${parts(date).day}`;
const diffDays = (a, b) => Math.round((Date.UTC(+parts(b).year, +parts(b).month - 1, +parts(b).day) - Date.UTC(+parts(a).year, +parts(a).month - 1, +parts(a).day)) / 86400000);

export const getUpcomingBirthdays = async (days = 30, now = new Date()) => {
  const members = await prisma.user.findMany({ where: { role: "MEMBER", status: "ACTIVE", memberProfile: { dateOfBirth: { not: null } } }, include: { memberProfile: { include: { hub: true } } } });
  const year = Number(parts(now).year);
  return members.map((user) => {
    let birthday = birthdayForYear(user.memberProfile.dateOfBirth, year);
    let left = diffDays(now, birthday);
    if (left < 0) { birthday = birthdayForYear(user.memberProfile.dateOfBirth, year + 1); left = diffDays(now, birthday); }
    return { userId: user.id, fullName: user.memberProfile.fullName, hub: user.memberProfile.hub?.name || "Not assigned", birthMonth: birthday.getUTCMonth() + 1, birthDay: birthday.getUTCDate(), daysLeft: left };
  }).filter((item) => item.daysLeft <= days).sort((a, b) => a.daysLeft - b.daysLeft);
};

export const runBirthdayReminderJob = async (now = new Date()) => {
  const upcoming = await getUpcomingBirthdays(3, now);
  const admins = await prisma.user.findMany({ where: { role: "ADMIN", status: "ACTIVE" }, select: { id: true } });
  let count = 0;
  for (const item of upcoming.filter((item) => [0, 1, 3].includes(item.daysLeft))) {
    const type = item.daysLeft === 0 ? "TODAY" : `${item.daysLeft}_DAYS`;
    const year = Number(parts(now).year);
    try { await prisma.birthdayReminder.create({ data: { memberId: item.userId, year, reminderType: type } }); } catch { continue; }
    const date = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(Date.UTC(2000, item.birthMonth - 1, item.birthDay)));
    const message = item.daysLeft === 0 ? `${item.fullName}'s birthday is today (${date})` : `${item.fullName}'s birthday is in ${item.daysLeft} day${item.daysLeft === 1 ? "" : "s"} (${date})`;
    await prisma.notification.createMany({ data: admins.map((admin) => ({ userId: admin.id, audience: "ADMIN", type: "BIRTHDAY_REMINDER", title: "Upcoming member birthday", message, relatedUserId: item.userId, link: `/admin/members/${item.userId}` })) });
    if (item.daysLeft === 0) await prisma.notification.create({ data: { userId: item.userId, audience: "MEMBER", type: "BIRTHDAY_GREETING", title: "Happy Birthday!", message: "Wishing you a wonderful birthday from VedaConnect!", link: "/dashboard" } });
    count += 1;
  }
  return { count };
};
