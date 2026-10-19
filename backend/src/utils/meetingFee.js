export const MEETING_FEE_PER_SATURDAY = 450;

export const getSaturdaysInMonth = (monthKey) => {
  const match = /^(\d{4})-(\d{2})$/.exec(monthKey);
  if (!match) throw new RangeError("Month must be in YYYY-MM format.");

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) throw new RangeError("Month must be in YYYY-MM format.");

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  let saturdays = 0;
  for (let day = 1; day <= daysInMonth; day += 1) {
    if (new Date(Date.UTC(year, month - 1, day)).getUTCDay() === 6) saturdays += 1;
  }
  return saturdays;
};

export const getMeetingFeeAmount = (monthKey) =>
  getSaturdaysInMonth(monthKey) * MEETING_FEE_PER_SATURDAY;
