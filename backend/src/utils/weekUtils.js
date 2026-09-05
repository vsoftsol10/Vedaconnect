export const getWeekStart = (date = new Date()) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);

  const daysSinceSaturday = (value.getDay() + 1) % 7;
  value.setDate(value.getDate() - daysSinceSaturday);
  return value;
};

export const getCurrentWeekStart = () => getWeekStart(new Date());

export const getCalendarWeekStart = (date = new Date()) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);

  const daysSinceMonday = (value.getDay() + 6) % 7;
  value.setDate(value.getDate() - daysSinceMonday);
  return value;
};

export const getCurrentCalendarWeekStart = () => getCalendarWeekStart(new Date());

export const getPreviousWeekStart = () => {
  const previous = getCurrentWeekStart();
  previous.setDate(previous.getDate() - 7);
  return previous;
};

export const getCurrentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

export const getMonthRange = (monthKey = getCurrentMonthKey()) => {
  const [year, month] = monthKey.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return { start, end };
};

export const getYearRange = (yearKey = new Date().getFullYear()) => {
  const year = Number(yearKey);
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  return { start, end };
};
