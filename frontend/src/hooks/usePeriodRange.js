import { useMemo, useState } from "react";

const pad = (value) => String(value).padStart(2, "0");
export const dateKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
export const monthKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
export const startOfWeek = (date = new Date()) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() - ((result.getDay() + 1) % 7));
  return result;
};

export const getPeriodRange = (period, offset = 0, now = new Date()) => {
  const current = new Date(now);
  current.setHours(0, 0, 0, 0);
  if (period === "week") {
    const start = startOfWeek(current);
    start.setDate(start.getDate() + offset * 7);
    const end = new Date(start); end.setDate(end.getDate() + 7);
    return { start, end, value: dateKey(start) };
  }
  if (period === "month") {
    const start = new Date(current.getFullYear(), current.getMonth() + offset, 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    return { start, end, value: monthKey(start) };
  }
  const start = new Date(current.getFullYear() + offset, 0, 1);
  const end = new Date(start.getFullYear() + 1, 0, 1);
  return { start, end, value: String(start.getFullYear()) };
};

export const formatPeriodRange = ({ period, start, end }) => {
  if (period === "year") return String(start.getFullYear());
  if (period === "month") return start.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  const lastDay = new Date(end); lastDay.setDate(lastDay.getDate() - 1);
  return `${start.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} - ${lastDay.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
};

export const usePeriodRange = (initialPeriod = "week") => {
  const [period, setPeriod] = useState(initialPeriod);
  const [offset, setOffset] = useState(0);
  const range = useMemo(() => ({ period, offset, ...getPeriodRange(period, offset) }), [period, offset]);
  return { period, offset, range, setPeriod: (next) => { setPeriod(next); setOffset(0); }, previous: () => setOffset((value) => value - 1), next: () => setOffset((value) => Math.min(0, value + 1)), canGoNext: offset < 0 };
};
