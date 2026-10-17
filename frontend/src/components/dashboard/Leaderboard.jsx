import { useEffect, useState } from "react";
import { Loader2, Trophy } from "lucide-react";
import { getLeaderboard } from "../../services/networkingService";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    Number(amount || 0)
  );

const isoDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const startOfWeek = (date = new Date()) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  const daysSinceSaturday = (value.getDay() + 1) % 7;
  value.setDate(value.getDate() - daysSinceSaturday);
  return value;
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
        rows.map((row) => (
          <div key={`${title}-${row.userId}`} className="flex items-center gap-3">
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
  const [weekStart] = useState(() => isoDate(startOfWeek()));
  const [data, setData] = useState({ referralsGiven: [], businessReceived: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError("");
      const result = await getLeaderboard({ period: "week", value: weekStart, winnersOnly: true });
      setData(result);
      setIsLoading(false);
    };
    load().catch((err) => {
      setError(err?.response?.data?.message || err.message || "Could not load this week's award leaders.");
      setIsLoading(false);
    });
  }, [weekStart]);

  return (
    <section className="mb-10">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <div>
            <h2 className="text-lg font-bold text-gray-900">This Week&apos;s Award Leaders</h2>
            <p className="text-sm text-gray-500">Week of {weekLabel(weekStart)}</p>
          </div>
        </div>
      </div>
      {isLoading ? (
        <div className="flex items-center gap-2 text-gray-500 bg-white border border-gray-100 rounded-2xl p-6">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading leaderboard
        </div>
      ) : error ? (
        <p role="alert" className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</p>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <RankedList title="Business Giver Award Leader" rows={data.referralsGiven || []} />
          <RankedList title="Business Achiever Award Leader" rows={data.businessReceived || []} />
        </div>
      )}
    </section>
  );
};

export default Leaderboard;
