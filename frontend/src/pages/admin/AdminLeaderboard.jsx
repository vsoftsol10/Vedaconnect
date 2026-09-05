import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Trophy } from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import { getWeeklyAttendance } from "../../services/attendanceService";
import { getMonthlyMeetingFees } from "../../services/meetingFeeService";
import { getAdminLeaderboard } from "../../services/adminService";
import { getHubs } from "../../services/hubService";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    Number(amount || 0)
  );

const statusClass = (status) => {
  if (status === "CONFIRMED" || status === "PAID") return "bg-green-50 text-green-700";
  if (status === "DECLINED" || status === "FAILED") return "bg-red-50 text-red-600";
  return "bg-amber-50 text-amber-700";
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

const LeaderboardTable = ({ rows }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm overflow-x-auto">
    <h2 className="font-bold text-gray-900 mb-4">Member Leaderboard</h2>
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs text-gray-400 uppercase">
          <th className="pb-3">Rank</th>
          <th className="pb-3">Member</th>
          <th className="pb-3">Hub</th>
          <th className="pb-3 text-right">Referrals given</th>
          <th className="pb-3 text-right">Business received</th>
        </tr>
      </thead>
      <tbody>
        {rows.length ? (
          rows.map((row, index) => (
            <tr key={row.userId} className="border-t border-gray-50">
              <td className="py-3 font-bold text-gray-900">{index + 1}</td>
              <td className="py-3">
                <p className="font-semibold text-gray-900">{row.fullName}</p>
                <p className="text-xs text-gray-400">{row.businessName || "-"}</p>
              </td>
              <td className="py-3 text-gray-600">{row.hubName || "-"}</td>
              <td className="py-3 text-right">
                <p className="font-bold text-gray-900">{row.referralCount}</p>
                <p className="text-xs text-green-700">{formatCurrency(row.referralAmount)}</p>
              </td>
              <td className="py-3 text-right">
                <p className="font-bold text-gray-900">{row.businessCount}</p>
                <p className="text-xs text-green-700">{formatCurrency(row.businessAmount)}</p>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={5} className="py-6 text-center text-gray-400">No entries yet.</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

const AdminLeaderboard = () => {
  const [period, setPeriod] = useState("week");
  const [value, setValue] = useState(isoDate(startOfWeek()));
  const [hub, setHub] = useState("all");
  const [sort, setSort] = useState("business");
  const [years, setYears] = useState([new Date().getFullYear()]);
  const [hubs, setHubs] = useState([]);
  const [leaderboard, setLeaderboard] = useState({ rows: [] });
  const [attendance, setAttendance] = useState([]);
  const [meetingFees, setMeetingFees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError("");
      const [leaderboardData, attendanceRows, feeRows, hubRows] = await Promise.all([
        getAdminLeaderboard({ period, value, hub, sort }),
        getWeeklyAttendance(),
        getMonthlyMeetingFees(),
        getHubs(),
      ]);
      setLeaderboard(leaderboardData);
      if (leaderboardData.years?.length) setYears(leaderboardData.years);
      setAttendance(attendanceRows);
      setMeetingFees(feeRows);
      setHubs(hubRows);
      setIsLoading(false);
    };
    load().catch((err) => {
      setError(err.message);
      setIsLoading(false);
    });
  }, [period, value, hub, sort]);

  const handlePeriodChange = (nextPeriod) => {
    setPeriod(nextPeriod);
    const now = new Date();
    if (nextPeriod === "week") setValue(isoDate(startOfWeek(now)));
    if (nextPeriod === "month") setValue(monthKey(now));
    if (nextPeriod === "year") setValue(String(now.getFullYear()));
  };

  return (
    <div className="flex min-h-screen bg-stone-50">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader title="Awards" />
        <main className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-amber-500" />
                <h1 className="text-2xl font-bold text-gray-900">Awards & Tracking</h1>
              </div>
              <p className="text-gray-500 mt-1">Leaderboard, attendance, and meeting fee status.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 justify-end">
              <div className="flex rounded-xl bg-white border border-gray-100 p-1">
                {["week", "month", "year"].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handlePeriodChange(key)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${
                      period === key ? "bg-amber-400 text-gray-900" : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>
              {period === "week" && (
                <div className="flex items-center rounded-xl bg-white border border-gray-100 p-1">
                  <button type="button" onClick={() => setValue((current) => shiftWeek(current, -7))} className="p-2 text-gray-500 hover:text-gray-900">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="min-w-32 px-2 text-center text-sm font-semibold text-gray-700">{weekLabel(value)}</span>
                  <button type="button" onClick={() => setValue((current) => shiftWeek(current, 7))} className="p-2 text-gray-500 hover:text-gray-900">
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
              <select
                value={hub}
                onChange={(event) => setHub(event.target.value)}
                className="rounded-xl border border-gray-100 bg-white px-3 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              >
                <option value="all">All Hubs</option>
                {hubs.map((row) => (
                  <option key={row.id} value={row.id}>{row.name}</option>
                ))}
              </select>
              <div className="flex rounded-xl bg-white border border-gray-100 p-1">
                {[
                  ["business", "Business"],
                  ["referrals", "Referrals"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSort(key)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      sort === key ? "bg-green-600 text-white" : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">{error}</div>}

          {isLoading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading awards
            </div>
          ) : (
            <>
              <div className="mb-6">
                <LeaderboardTable rows={leaderboard.rows || []} />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm overflow-x-auto">
                  <h2 className="font-bold text-gray-900 mb-4">This Week's Attendance</h2>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-400 uppercase">
                        <th className="pb-3">Member</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Responded</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map((row) => (
                        <tr key={row.userId} className="border-t border-gray-50">
                          <td className="py-3">
                            <p className="font-semibold text-gray-900">{row.fullName}</p>
                            <p className="text-xs text-gray-400">{row.businessName || "-"}</p>
                          </td>
                          <td className="py-3">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass(row.status)}`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="py-3 text-gray-500">
                            {row.respondedAt ? new Date(row.respondedAt).toLocaleString("en-IN") : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm overflow-x-auto">
                  <h2 className="font-bold text-gray-900 mb-4">Meeting Fee Status</h2>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-400 uppercase">
                        <th className="pb-3">Member</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {meetingFees.map((row) => (
                        <tr key={row.userId} className="border-t border-gray-50">
                          <td className="py-3">
                            <p className="font-semibold text-gray-900">{row.fullName}</p>
                            <p className="text-xs text-gray-400">{row.businessName || "-"}</p>
                          </td>
                          <td className="py-3 text-gray-600">{formatCurrency(row.amount)}</td>
                          <td className="py-3">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass(row.paymentStatus)}`}>
                              {row.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminLeaderboard;
