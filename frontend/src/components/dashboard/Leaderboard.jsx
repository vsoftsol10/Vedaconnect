import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Trophy } from "lucide-react";
import { getLeaderboard } from "../../services/networkingService";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    Number(amount || 0)
  );

const rankClass = (index) => {
  if (index === 0) return "bg-amber-400 text-gray-900";
  if (index === 1) return "bg-gray-200 text-gray-700";
  if (index === 2) return "bg-green-100 text-green-700";
  return "bg-gray-50 text-gray-500";
};

const isoDate = (date) => date.toISOString().slice(0, 10);
const monthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const startOfWeek = (date = new Date()) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  const daysSinceMonday = (value.getDay() + 6) % 7;
  value.setDate(value.getDate() - daysSinceMonday);
  return value;
};

const shiftWeek = (weekStart, days) => {
  const next = new Date(`${weekStart}T00:00:00`);
  next.setDate(next.getDate() + days);
  return isoDate(next);
};

const weekLabel = (weekStart) => {
  const start = new Date(`${weekStart}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return `${start.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} - ${end.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  })}`;
};

const RankedList = ({ title, rows }) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
    <h3 className="font-bold text-gray-900 mb-4">{title}</h3>
    <div className="space-y-3">
      {rows.length ? (
        rows.map((row, index) => (
          <div key={`${title}-${row.userId}`} className="flex items-center gap-3">
            <span className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${rankClass(index)}`}>
              {index + 1}
            </span>
            {row.profilePhoto ? (
              <img src={row.profilePhoto} alt={row.fullName} className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center font-semibold text-amber-700">
                {row.fullName?.[0] || "?"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900 truncate">{row.fullName}</p>
              <p className="text-xs text-gray-400 truncate">{row.businessName || "VedaConnect member"}</p>
            </div>
            <p className="font-bold text-green-700">{formatCurrency(row.total)}</p>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-400">No entries yet.</p>
      )}
    </div>
  </div>
);

const Leaderboard = () => {
  const [period, setPeriod] = useState("week");
  const [value, setValue] = useState(isoDate(startOfWeek()));
  const [years, setYears] = useState([new Date().getFullYear()]);
  const [data, setData] = useState({ referralsGiven: [], businessReceived: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const result = await getLeaderboard({ period, value });
      setData(result);
      if (result.years?.length) setYears(result.years);
      setIsLoading(false);
    };
    load().catch(() => setIsLoading(false));
  }, [period, value]);

  const handlePeriodChange = (nextPeriod) => {
    setPeriod(nextPeriod);
    const now = new Date();
    if (nextPeriod === "week") setValue(isoDate(startOfWeek(now)));
    if (nextPeriod === "month") setValue(monthKey(now));
    if (nextPeriod === "year") setValue(String(now.getFullYear()));
  };

  return (
    <section className="mb-10">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-bold text-gray-900">Leaderboard</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <div className="flex w-full rounded-xl bg-white border border-gray-100 p-1 sm:w-auto">
            {["week", "month", "year"].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handlePeriodChange(key)}
                className={`min-h-11 flex-1 px-3 py-2 rounded-lg text-sm font-semibold capitalize transition-colors sm:flex-none sm:px-4 ${
                  period === key ? "bg-amber-400 text-gray-900" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {key}
              </button>
            ))}
          </div>
          {period === "week" && (
            <div className="flex w-full items-center justify-between rounded-xl bg-white border border-gray-100 p-1 sm:w-auto">
              <button type="button" onClick={() => setValue((current) => shiftWeek(current, -7))} className="inline-flex h-11 w-11 items-center justify-center text-gray-500 hover:text-gray-900">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-2 text-center text-sm font-semibold text-gray-700">{weekLabel(value)}</span>
              <button type="button" onClick={() => setValue((current) => shiftWeek(current, 7))} className="inline-flex h-11 w-11 items-center justify-center text-gray-500 hover:text-gray-900">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
          {period === "month" && (
            <input
              type="month"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="rounded-xl border border-gray-100 bg-white px-3 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          )}
          {period === "year" && (
            <select
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="rounded-xl border border-gray-100 bg-white px-3 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          )}
        </div>
      </div>
      {isLoading ? (
        <div className="flex items-center gap-2 text-gray-500 bg-white border border-gray-100 rounded-2xl p-6">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading leaderboard
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <RankedList title="Top Referrals Given" rows={data.referralsGiven || []} />
          <RankedList title="Top Business Received" rows={data.businessReceived || []} />
        </div>
      )}
    </section>
  );
};

export default Leaderboard;
