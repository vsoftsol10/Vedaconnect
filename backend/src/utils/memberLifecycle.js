export const sixMonthsFrom = (date) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 6);
  return result;
};

export const suspensionFields = (previousStatus, now = new Date()) => ({
  previousStatus,
  membershipStatus: "SUSPENDED",
  suspendedAt: now,
  autoDeleteAt: sixMonthsFrom(now),
});

export const reactivationFields = (previousStatus) => ({
  membershipStatus: previousStatus || "ACTIVE",
  previousStatus: null,
  suspendedAt: null,
  autoDeleteAt: null,
});

export const isPastAutoDeleteDate = (member, now = new Date()) =>
  member.membershipStatus === "SUSPENDED" && !member.deletedAt && member.autoDeleteAt && new Date(member.autoDeleteAt) <= now;
