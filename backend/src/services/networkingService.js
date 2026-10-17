import { prisma } from "../config/prismaClient.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  getCurrentMonthKey,
  getCurrentWeekStart,
  getMonthRange,
  getWeekStart,
  getYearRange,
} from "../utils/weekUtils.js";
import { notifyAdmins, notifyUser } from "./notificationService.js";

const memberSelect = {
  id: true,
  email: true,
  memberProfile: { select: { fullName: true, profilePhoto: true, businessName: true } },
};

const displayName = (user) => user?.memberProfile?.fullName || user?.fullName || user?.email || "Member";

const ensureMember = async (userId, label = "Member") => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: memberSelect });
  if (!user || !user.memberProfile) throw new AppError(`${label} not found.`, 404);
  return user;
};

const money = (value) => Number(value || 0);

const mapReferral = (item) => ({
  id: item.id,
  amount: money(item.amount),
  description: item.description,
  weekStart: item.weekStart,
  createdAt: item.createdAt,
  receiverType: item.receiverType?.toLowerCase?.() || item.receiverType,
  receiver:
    item.receiverType === "EXTERNAL"
      ? {
          userId: null,
          fullName: item.externalName,
          profilePhoto: null,
          businessName: item.externalBusiness,
          contact: item.externalContact,
        }
      : {
          userId: item.receiver?.id,
          fullName: displayName(item.receiver),
          profilePhoto: item.receiver?.memberProfile?.profilePhoto,
          businessName: item.receiver?.memberProfile?.businessName,
        },
});

const mapBusiness = (item) => ({
  id: item.id,
  amount: money(item.amount),
  description: item.description,
  weekStart: item.weekStart,
  createdAt: item.createdAt,
  referrerType: item.referrerType?.toLowerCase?.() || item.referrerType,
  referrer:
    item.referrerType === "EXTERNAL"
      ? {
          userId: null,
          fullName: item.externalName,
          profilePhoto: null,
          businessName: item.externalBusiness,
          contact: item.externalContact,
        }
      : {
          userId: item.referrer?.id,
          fullName: displayName(item.referrer),
          profilePhoto: item.referrer?.memberProfile?.profilePhoto,
          businessName: item.referrer?.memberProfile?.businessName,
        },
});

const apiPartyToPrisma = (type) => (type === "external" ? "EXTERNAL" : "MEMBER");

export const logReferralGiven = async ({
  giverId,
  receiverType = "member",
  receiverId,
  externalName,
  externalBusiness,
  externalContact,
  amount,
  description,
}) => {
  if (receiverType === "member" && giverId === receiverId) {
    throw new AppError("Choose another member for the referral.", 400);
  }

  const giver = await ensureMember(giverId, "Giver");
  const receiver = receiverType === "member" ? await ensureMember(receiverId, "Receiver") : null;

  const referral = await prisma.referralGiven.create({
    data: {
      giverId,
      receiverType: apiPartyToPrisma(receiverType),
      receiverId: receiverType === "member" ? receiverId : null,
      externalName: receiverType === "external" ? externalName : null,
      externalBusiness: receiverType === "external" ? externalBusiness || null : null,
      externalContact: receiverType === "external" ? externalContact || null : null,
      amount,
      description,
      weekStart: getCurrentWeekStart(),
    },
  });

  const notifications = [
    notifyAdmins({
      type: "REFERRAL_GIVEN",
      title: "Referral logged",
      message:
        receiverType === "member"
          ? `${displayName(giver)} gave a referral to ${displayName(receiver)}.`
          : `${displayName(giver)} gave a referral to ${externalName}.`,
      relatedUserId: giverId,
      link: "/admin/leaderboard",
    }),
  ];

  if (receiverType === "member") {
    notifications.push(notifyUser({
      userId: receiverId,
      type: "REFERRAL_GIVEN",
      title: "You received a referral",
      message: `You received a referral from ${displayName(giver)}.`,
      relatedUserId: giverId,
      link: "/networking",
    }));
  }

  await Promise.all(notifications);

  return { id: referral.id };
};

export const logBusinessReceived = async ({
  receiverId,
  referrerType = "member",
  referrerId,
  externalName,
  externalBusiness,
  externalContact,
  amount,
  description,
}) => {
  if (referrerType === "member" && receiverId === referrerId) {
    throw new AppError("Choose another member as the referrer.", 400);
  }

  const receiver = await ensureMember(receiverId, "Receiver");
  const referrer = referrerType === "member" ? await ensureMember(referrerId, "Referrer") : null;

  const business = await prisma.businessReceived.create({
    data: {
      receiverId,
      referrerType: apiPartyToPrisma(referrerType),
      referrerId: referrerType === "member" ? referrerId : null,
      externalName: referrerType === "external" ? externalName : null,
      externalBusiness: referrerType === "external" ? externalBusiness || null : null,
      externalContact: referrerType === "external" ? externalContact || null : null,
      amount,
      description,
      weekStart: getCurrentWeekStart(),
    },
  });

  const notifications = [
    notifyAdmins({
      type: "BUSINESS_RECEIVED",
      title: "Business received logged",
      message:
        referrerType === "member"
          ? `${displayName(receiver)} logged business received from ${displayName(referrer)}.`
          : `${displayName(receiver)} logged business received from ${externalName}.`,
      relatedUserId: receiverId,
      link: "/admin/leaderboard",
    }),
  ];

  if (referrerType === "member") {
    notifications.push(notifyUser({
      userId: referrerId,
      type: "BUSINESS_RECEIVED",
      title: "Business credit logged",
      message: `${displayName(receiver)} credited you for business received.`,
      relatedUserId: receiverId,
      link: "/networking",
    }));
  }

  await Promise.all(notifications);

  return { id: business.id };
};

export const getMyReferralsGiven = async (userId) => {
  const items = await prisma.referralGiven.findMany({
    where: { giverId: userId },
    include: { receiver: { select: memberSelect } },
    orderBy: { createdAt: "desc" },
  });
  return items.map(mapReferral);
};

export const getMyBusinessReceived = async (userId) => {
  const items = await prisma.businessReceived.findMany({
    where: { receiverId: userId },
    include: { referrer: { select: memberSelect } },
    orderBy: { createdAt: "desc" },
  });
  return items.map(mapBusiness);
};

const hydrateLeaderboard = async (rows, userField) => {
  const users = await prisma.user.findMany({
    where: { id: { in: rows.map((row) => row[userField]).filter(Boolean) } },
    select: {
      ...memberSelect,
      memberProfile: { select: { fullName: true, profilePhoto: true, businessName: true, hub: { select: { id: true, name: true } } } },
    },
  });
  const userMap = new Map(users.map((user) => [user.id, user]));

  return rows
    .map((row) => {
      const user = userMap.get(row[userField]);
      return {
        userId: row[userField],
        fullName: displayName(user),
        profilePhoto: user?.memberProfile?.profilePhoto || null,
        businessName: user?.memberProfile?.businessName || null,
        hubId: user?.memberProfile?.hub?.id || null,
        hubName: user?.memberProfile?.hub?.name || "-",
        count: row._count?._all || 0,
        total: money(row._sum.amount),
      };
    })
    .sort((a, b) => b.total - a.total);
};

export const resolveLeaderboardRange = ({ period = "week", value } = {}) => {
  if (period === "month") {
    const month = value || getCurrentMonthKey();
    return { period, value: month, ...getMonthRange(month) };
  }
  if (period === "year") {
    const year = value || String(new Date().getFullYear());
    return { period, value: year, ...getYearRange(year) };
  }

  const start = getWeekStart(value ? new Date(value) : getCurrentWeekStart());
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { period: "week", value: start.toISOString().slice(0, 10), start, end };
};

const hubUserWhere = (userField, hub) =>
  hub && hub !== "all" ? { [userField]: { memberProfile: { is: { hubId: hub } } } } : {};

export const getLeaderboard = async ({ period = "week", value, hub = "all", limit = 10 } = {}) => {
  const range = resolveLeaderboardRange({ period, value });
  const take = limit ? { take: limit } : {};
  const [referrals, business] = await Promise.all([
    prisma.referralGiven.groupBy({
      by: ["giverId"],
      where: {
        receiverType: "MEMBER",
        createdAt: { gte: range.start, lt: range.end },
        ...hubUserWhere("giver", hub),
      },
      _sum: { amount: true },
      _count: { _all: true },
      orderBy: { _sum: { amount: "desc" } },
      ...take,
    }),
    prisma.businessReceived.groupBy({
      by: ["receiverId"],
      where: {
        referrerType: "MEMBER",
        createdAt: { gte: range.start, lt: range.end },
        ...hubUserWhere("receiver", hub),
      },
      _sum: { amount: true },
      _count: { _all: true },
      orderBy: { _sum: { amount: "desc" } },
      ...take,
    }),
  ]);

  return {
    period: range.period,
    value: range.value,
    start: range.start,
    end: range.end,
    referralsGiven: await hydrateLeaderboard(referrals, "giverId"),
    businessReceived: await hydrateLeaderboard(business, "receiverId"),
  };
};

export const getWeeklyLeaderboard = async (weekStart) =>
  getLeaderboard({ period: "week", value: weekStart ? new Date(weekStart).toISOString().slice(0, 10) : undefined });

export const getMonthlyLeaderboard = async (month) => getLeaderboard({ period: "month", value: month });

const combineRows = (leaderboard, sort = "business") => {
  const rows = new Map();
  const ensure = (row) => {
    if (!rows.has(row.userId)) {
      rows.set(row.userId, {
        userId: row.userId,
        fullName: row.fullName,
        businessName: row.businessName,
        hubId: row.hubId,
        hubName: row.hubName,
        profilePhoto: row.profilePhoto,
        referralCount: 0,
        referralAmount: 0,
        businessCount: 0,
        businessAmount: 0,
      });
    }
    return rows.get(row.userId);
  };

  leaderboard.referralsGiven.forEach((row) => {
    const target = ensure(row);
    target.referralCount = row.count;
    target.referralAmount = row.total;
  });
  leaderboard.businessReceived.forEach((row) => {
    const target = ensure(row);
    target.businessCount = row.count;
    target.businessAmount = row.total;
  });

  return [...rows.values()].sort((a, b) => {
    if (sort === "referrals") {
      return b.referralAmount - a.referralAmount || b.referralCount - a.referralCount || b.businessAmount - a.businessAmount;
    }
    return b.businessAmount - a.businessAmount || b.businessCount - a.businessCount || b.referralCount - a.referralCount;
  });
};

export const getAdminLeaderboard = async ({ period, value, hub, sort } = {}) => {
  const range = resolveLeaderboardRange({ period, value });
  const manualWhere = {
    weekStart: { gte: range.start, lt: range.end },
    ...hubUserWhere("user", hub),
  };
  const activityWhere = (party, userField) => ({
    [party === "referral" ? "receiverType" : "referrerType"]: "MEMBER",
    weekStart: { gte: range.start, lt: range.end },
    ...hubUserWhere(userField, hub),
  });
  const manualEntrySelect = {
    id: true,
    userId: true,
    weekStart: true,
    referralCount: true,
    referralAmount: true,
    businessCount: true,
    businessAmount: true,
    user: {
      select: {
        email: true,
        memberProfile: {
          select: {
            fullName: true,
            businessName: true,
            hubId: true,
            hub: { select: { name: true } },
          },
        },
      },
    },
  };
  const [periodManualEntries, manualEntries, referrals, business] = await Promise.all([
    prisma.manualWeeklyAwardEntry.findMany({
      where: manualWhere,
      select: manualEntrySelect,
    }),
    prisma.manualWeeklyAwardEntry.findMany({
      where: hubUserWhere("user", hub),
      orderBy: [{ weekStart: "desc" }, { createdAt: "desc" }],
      select: manualEntrySelect,
    }),
    prisma.referralGiven.findMany({
      where: activityWhere("referral", "giver"),
      select: { giverId: true, amount: true, weekStart: true },
    }),
    prisma.businessReceived.findMany({
      where: activityWhere("business", "receiver"),
      select: { receiverId: true, amount: true, weekStart: true },
    }),
  ]);

  const weekKey = (date) => date.toISOString().slice(0, 10);
  const manualWeeks = new Set(periodManualEntries.map((entry) => `${entry.userId}:${weekKey(entry.weekStart)}`));
  const totalsByUser = () => new Map();
  const addTotal = (totals, userId, count, amount) => {
    const current = totals.get(userId) || { count: 0, total: 0 };
    current.count += count;
    current.total += Number(amount || 0);
    totals.set(userId, current);
  };
  const referralTotals = totalsByUser();
  const businessTotals = totalsByUser();

  referrals.forEach((row) => {
    if (!manualWeeks.has(`${row.giverId}:${weekKey(row.weekStart)}`)) {
      addTotal(referralTotals, row.giverId, 1, row.amount);
    }
  });
  business.forEach((row) => {
    if (!manualWeeks.has(`${row.receiverId}:${weekKey(row.weekStart)}`)) {
      addTotal(businessTotals, row.receiverId, 1, row.amount);
    }
  });
  periodManualEntries.forEach((entry) => {
    addTotal(referralTotals, entry.userId, entry.referralCount, entry.referralAmount);
    addTotal(businessTotals, entry.userId, entry.businessCount, entry.businessAmount);
  });

  const leaderboard = {
    period: range.period,
    value: range.value,
    start: range.start,
    end: range.end,
    referralsGiven: await hydrateLeaderboard(
      [...referralTotals].map(([giverId, total]) => ({ giverId, _count: { _all: total.count }, _sum: { amount: total.total } })),
      "giverId"
    ),
    businessReceived: await hydrateLeaderboard(
      [...businessTotals].map(([receiverId, total]) => ({ receiverId, _count: { _all: total.count }, _sum: { amount: total.total } })),
      "receiverId"
    ),
  };
  return {
    ...leaderboard,
    rows: combineRows(leaderboard, sort),
    manualEntries: manualEntries.map((entry) => ({
      id: entry.id,
      userId: entry.userId,
      hubId: entry.user.memberProfile?.hubId || "",
      fullName: entry.user.memberProfile?.fullName || entry.user.email || "Member",
      businessName: entry.user.memberProfile?.businessName || "",
      hubName: entry.user.memberProfile?.hub?.name || "",
      weekStart: entry.weekStart,
      referralAmount: Number(entry.referralAmount),
      businessAmount: Number(entry.businessAmount),
    })),
  };
};

export const getManualWeeklyAwardActivity = async ({ userId, weekStart }) => {
  const start = new Date(`${weekStart}T00:00:00.000Z`);
  const [referrals, business] = await Promise.all([
    prisma.referralGiven.aggregate({
      where: { giverId: userId, receiverType: "MEMBER", weekStart: start },
      _count: { _all: true },
      _sum: { amount: true },
    }),
    prisma.businessReceived.aggregate({
      where: { receiverId: userId, referrerType: "MEMBER", weekStart: start },
      _count: { _all: true },
      _sum: { amount: true },
    }),
  ]);
  const summarize = (result) => ({ count: result._count._all, amount: Number(result._sum.amount || 0) });
  return { referrals: summarize(referrals), business: summarize(business) };
};

export const saveManualWeeklyAward = async ({ hubId, userId, weekStart, referralAmount, businessAmount }) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      role: "MEMBER",
      status: { not: "DELETED" },
      memberProfile: { is: { hubId } },
    },
    select: { id: true },
  });
  if (!user) throw new AppError("Selected member does not belong to the selected hub.", 400);

  const start = new Date(`${weekStart}T00:00:00.000Z`);
  return prisma.manualWeeklyAwardEntry.upsert({
    where: { userId_weekStart: { userId, weekStart: start } },
    update: { referralAmount, businessAmount },
    create: { userId, weekStart: start, referralAmount, businessAmount },
  });
};

export const updateManualWeeklyAward = async (id, { hubId, userId, weekStart, referralAmount, businessAmount }) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      role: "MEMBER",
      status: { not: "DELETED" },
      memberProfile: { is: { hubId } },
    },
    select: { id: true },
  });
  if (!user) throw new AppError("Selected member does not belong to the selected hub.", 400);

  const existing = await prisma.manualWeeklyAwardEntry.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new AppError("Award entry not found.", 404);

  const start = new Date(`${weekStart}T00:00:00.000Z`);
  const duplicate = await prisma.manualWeeklyAwardEntry.findFirst({
    where: { userId, weekStart: start, NOT: { id } },
    select: { id: true },
  });
  if (duplicate) throw new AppError("An award entry already exists for this member and week.", 409);

  return prisma.manualWeeklyAwardEntry.update({
    where: { id },
    data: { userId, weekStart: start, referralAmount, businessAmount },
  });
};

export const deleteManualWeeklyAward = async (id) => {
  const existing = await prisma.manualWeeklyAwardEntry.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new AppError("Award entry not found.", 404);
  await prisma.manualWeeklyAwardEntry.delete({ where: { id } });
  return { id };
};

export const getLeaderboardYears = async () => {
  const [referral, business] = await Promise.all([
    prisma.referralGiven.findFirst({ orderBy: { createdAt: "asc" }, select: { createdAt: true } }),
    prisma.businessReceived.findFirst({ orderBy: { createdAt: "asc" }, select: { createdAt: true } }),
  ]);
  const currentYear = new Date().getFullYear();
  const earliest = [referral?.createdAt, business?.createdAt]
    .filter(Boolean)
    .map((date) => date.getFullYear())
    .sort((a, b) => a - b)[0] || currentYear;

  return Array.from({ length: currentYear - earliest + 1 }, (_, index) => currentYear - index);
};
