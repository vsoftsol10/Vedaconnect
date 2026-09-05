export const calculateExpiryDate = (joinedAt, billingCycle) => {
  if (!billingCycle || billingCycle.toUpperCase().includes("LIFETIME")) return null;
  const monthsMatch = billingCycle.match(/(\d+)\s*Month/i);
  const months = monthsMatch ? parseInt(monthsMatch[1], 10) : 12;
  const expiry = new Date(joinedAt);
  expiry.setMonth(expiry.getMonth() + months);
  return expiry;
};
