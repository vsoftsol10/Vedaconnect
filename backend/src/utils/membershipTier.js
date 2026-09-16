import { AppError } from "../middleware/errorHandler.js";

export const getMembershipTierForPlan = (plan) => {
  if (!plan) throw new AppError("Membership plan not found.", 404);
  const identity = `${plan?.planCode || ""} ${plan?.name || ""}`.trim().toUpperCase();
  return identity.includes("FOUNDING") ? "FOUNDING_MEMBER" : "MEMBER";
};

// Renewal deliberately does not filter by isActive or active dates: those settings
// govern new sign-ups, while a member's stored tier governs their renewal price.
export const getPlanForMembershipTier = async (prisma, tier) => {
  if (!tier) throw new AppError("Membership tier is missing. Contact an administrator.", 400);
  const plans = await prisma.membershipPlan.findMany({ orderBy: { createdAt: "asc" } });
  const plan = plans.find((candidate) => getMembershipTierForPlan(candidate) === tier);
  if (!plan) throw new AppError(`No ${tier.replace("_", " ")} plan is configured.`, 404);
  return plan;
};
