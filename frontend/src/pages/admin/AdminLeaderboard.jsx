import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import { getAdminAttendance, getAdminLeaderboard, getAdminMeetingFees } from "../../services/adminService";
import { getHubs } from "../../services/hubService";
import Dropdown from "../../components/ui/Dropdown";
import Pagination, { usePagination } from "../../components/ui/Pagination";
import Table, { Cell, HeaderCell } from "../../components/ui/Table";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    Number(amount || 0)
  );

const statusClass = (status) => {
  if (status === "CONFIRMED" || status === "PAID") return "bg-green-50 text-green-700";
  if (status === "DECLINED" || status === "FAILED") return "bg-red-50 text-red-600";
  return "bg-amber-50 text-amber-700";
};

const isoDate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const monthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const startOfWeek = (date = new Date()) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  const daysSinceSaturday = (value.getDay() + 1) % 7;
  value.setDate(value.getDate() - daysSinceSaturday);
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

const queryString = (values) => {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return params.toString();
};

const LeaderboardTable = ({ rows }) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const visibleRows = usePagination(rows, page, rowsPerPage);
  useEffect(() => setPage(1), [rows, rowsPerPage]);
  return <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm sm:p-6">
    <h2 className="font-bold text-gray-900 mb-4">Member Leaderboard</h2>
    <Table minWidth="min-w-[760px]">
      <thead>
        <tr><HeaderCell align="center">Rank</HeaderCell><HeaderCell>Member</HeaderCell><HeaderCell>Hub</HeaderCell><HeaderCell align="right">Referrals given</HeaderCell><HeaderCell align="right">Business received</HeaderCell></tr>
      </thead>
      <tbody>
        {rows.length ? (
          visibleRows.map((row, index) => (
            <tr key={row.userId}>
              <Cell align="center"><span className="font-bold text-gray-900">{(page - 1) * rowsPerPage + index + 1}</span></Cell>
              <Cell title={`${row.fullName} ${row.businessName || ""}`}>
                <p className="font-semibold text-gray-900">{row.fullName}</p>
                <p className="text-xs text-gray-400">{row.businessName || "-"}</p>
              </Cell>
              <Cell title={row.hubName}>{row.hubName || "-"}</Cell>
              <Cell align="right">
                <p className="font-bold text-gray-900">{row.referralCount}</p>
                <p className="text-xs text-green-700">{formatCurrency(row.referralAmount)}</p>
              </Cell>
              <Cell align="right">
                <p className="font-bold text-gray-900">{row.businessCount}</p>
                <p className="text-xs text-green-700">{formatCurrency(row.businessAmount)}</p>
              </Cell>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={5} className="vc-cell text-center text-gray-400">No entries yet.</td>
          </tr>
        )}
      </tbody>
    </Table>
    <Pagination page={page} onPageChange={setPage} rowsPerPage={rowsPerPage} onRowsPerPageChange={(value) => { setRowsPerPage(value); setPage(1); }} total={rows.length} />
  </div>;
};

const AdminLeaderboard = () => {
  const [period, setPeriod] = useState("week");
  const [value, setValue] = useState(isoDate(startOfWeek()));
  const [hub, setHub] = useState("all");
  const [sort, setSort] = useState("business");
  const [years, setYears] = useState([new Date().getFullYear()]);
  const [hubs, setHubs] = useState([]);
  const [leaderboard, setLeaderboard] = useState({ rows: [] });
  const [attendance, setAttendance] = useState({ rows: [], filteredCount: 0 });
  const [meetingFees, setMeetingFees] = useState({ rows: [], filteredTotals: { count: 0, collected: 0, pendingAmount: 0 } });
  const [attendanceSearch, setAttendanceSearch] = useState("");
  const [attendanceStatus, setAttendanceStatus] = useState("");
  const [feeSearch, setFeeSearch] = useState("");
  const [feeStatus, setFeeStatus] = useState("");
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError("");
      const [leaderboardData, hubRows] = await Promise.all([
        getAdminLeaderboard({ period, value, hub, sort }),
        getHubs(),
      ]);
      setLeaderboard(leaderboardData);
      if (leaderboardData.years?.length) setYears(leaderboardData.years);
      setHubs(hubRows);
      setIsLoading(false);
    };
    load().catch((err) => {
      setError(err.message);
      setIsLoading(false);
    });
  }, [period, value, hub, sort]);

  const previewWeekStart = period === "week" ? value : isoDate(startOfWeek());
  const previewMonth = period === "week" ? value.slice(0, 7) : period === "month" ? value : monthKey(new Date());
  const previewHub = hub === "all" ? undefined : hub;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPreviewLoading(true);
      Promise.all([
        getAdminAttendance({
          weekStart: previewWeekStart,
          hub: previewHub,
          search: attendanceSearch.trim() || undefined,
          status: attendanceStatus || undefined,
          page: 1,
          pageSize: 10,
        }),
        getAdminMeetingFees({
          month: previewMonth,
          hub: previewHub,
          search: feeSearch.trim() || undefined,
          status: feeStatus || undefined,
          page: 1,
          pageSize: 10,
        }),
      ])
        .then(([attendanceData, feeData]) => {
          setAttendance(attendanceData);
          setMeetingFees(feeData);
        })
        .catch((err) => setError(err.message))
        .finally(() => setIsPreviewLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [previewWeekStart, previewMonth, previewHub, attendanceSearch, attendanceStatus, feeSearch, feeStatus]);

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
      <div className="min-w-0 flex-1">
        <AdminHeader title="Awards" />
        <main className="px-4 py-6 sm:px-6 md:p-8">
          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-amber-500" />
                <h1 className="text-2xl font-bold text-gray-900">Awards & Tracking</h1>
              </div>
              <p className="text-gray-500 mt-1">Leaderboard, attendance, and meeting fee status.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 xl:justify-end">
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
                  <button type="button" onClick={() => setValue((current) => shiftWeek(current, -7))} className="p-2 text-gray-500 hover:text-gray-900">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="px-2 text-center text-sm font-semibold text-gray-700">{weekLabel(value)}</span>
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
                <Dropdown value={value} onChange={setValue} className="w-full sm:w-32" options={years.map((year) => ({ value: String(year), label: String(year) }))} />
              )}
              <Dropdown value={hub} onChange={setHub} className="w-full sm:w-48" options={[{ value: "all", label: "All Hubs" }, ...hubs.map((row) => ({ value: row.id, label: row.name }))]} />
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
                <div className="min-w-0 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="font-bold text-gray-900">This Week's Attendance</h2>
                      <p className="mt-1 text-sm text-gray-500">{attendance.filteredCount || 0} members match</p>
                    </div>
                    <Link to={`/admin/attendance?${queryString({ search: attendanceSearch.trim(), status: attendanceStatus, hub: previewHub, weekStart: previewWeekStart })}`} className="text-sm font-semibold text-green-700 hover:text-green-800">
                      View all with filters
                    </Link>
                  </div>
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                    <input value={attendanceSearch} onChange={(event) => setAttendanceSearch(event.target.value)} placeholder="Search member or business" className="min-h-10 flex-1 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100" />
                    <select value={attendanceStatus} onChange={(event) => setAttendanceStatus(event.target.value)} className="min-h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100">
                      <option value="">All statuses</option><option value="CONFIRMED">Confirmed</option><option value="PENDING">Pending</option><option value="ABSENT">Absent</option>
                    </select>
                  </div>
                  <div className="overflow-x-auto">
                    <Table minWidth="min-w-[500px]">
                      <thead><tr className="text-left text-xs text-gray-400 uppercase"><th className="pb-3">Member</th><th className="pb-3 whitespace-nowrap">Status</th><th className="pb-3 whitespace-nowrap">Responded</th></tr></thead>
                      <tbody>{attendance.rows?.length ? attendance.rows.map((row) => (
                        <tr key={row.userId} className="border-t border-gray-50"><td className="py-3"><p className="font-semibold text-gray-900">{row.fullName}</p><p className="text-xs text-gray-400">{row.businessName || "-"}</p></td><td className="py-3 whitespace-nowrap"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass(row.status)}`}>{row.status}</span></td><td className="py-3 whitespace-nowrap text-gray-500">{row.respondedAt ? new Date(row.respondedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "-"}</td></tr>
                      )) : <tr><td colSpan={3} className="py-6 text-center text-sm text-gray-400">{isPreviewLoading ? "Loading…" : "No members match your filters."}</td></tr>}</tbody>
                    </Table>
                  </div>
                </div>

                <div className="min-w-0 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div><h2 className="font-bold text-gray-900">Meeting Fee Status</h2><p className="mt-1 text-sm text-gray-500">{meetingFees.filteredTotals?.count || 0} members · {formatCurrency(meetingFees.filteredTotals?.collected)} collected · {formatCurrency(meetingFees.filteredTotals?.pendingAmount)} pending</p></div>
                    <Link to={`/admin/meeting-fees?${queryString({ search: feeSearch.trim(), status: feeStatus, hub: previewHub, month: previewMonth, weekStart: previewWeekStart })}`} className="text-sm font-semibold text-green-700 hover:text-green-800">View all with filters</Link>
                  </div>
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row"><input value={feeSearch} onChange={(event) => setFeeSearch(event.target.value)} placeholder="Search member or business" className="min-h-10 flex-1 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100" /><select value={feeStatus} onChange={(event) => setFeeStatus(event.target.value)} className="min-h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"><option value="">All statuses</option><option value="PAID">Paid</option><option value="PENDING">Pending</option></select></div>
                  <div className="overflow-x-auto"><Table minWidth="min-w-[500px]"><thead><tr className="text-left text-xs text-gray-400 uppercase"><th className="pb-3">Member</th><th className="pb-3 whitespace-nowrap">Amount</th><th className="pb-3 whitespace-nowrap">Status</th></tr></thead><tbody>{meetingFees.rows?.length ? meetingFees.rows.map((row) => (<tr key={row.userId} className="border-t border-gray-50"><td className="py-3"><p className="font-semibold text-gray-900">{row.fullName}</p><p className="text-xs text-gray-400">{row.businessName || "-"}</p></td><td className="py-3 whitespace-nowrap text-gray-600">{formatCurrency(row.amount)}</td><td className="py-3 whitespace-nowrap"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass(row.paymentStatus)}`}>{row.paymentStatus}</span>{row.paymentStatus === "PAID" && row.paymentSource === "MANUAL" && <span className="ml-2 inline-flex rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">Manual</span>}</td></tr>)) : <tr><td colSpan={3} className="py-6 text-center text-sm text-gray-400">{isPreviewLoading ? "Loading…" : "No members match your filters."}</td></tr>}</tbody></Table></div>
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
