export const MEETING_FEE_PER_SATURDAY = 450;

export const getSaturdaysInMonth = (monthKey) => {
  const [year, month] = monthKey.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  let saturdays = 0;
  for (let day = 1; day <= daysInMonth; day += 1) {
    if (new Date(year, month - 1, day).getDay() === 6) saturdays += 1;
  }
  return saturdays;
};

export const getMeetingFeeAmount = (monthKey) =>
  getSaturdaysInMonth(monthKey) * MEETING_FEE_PER_SATURDAY;
