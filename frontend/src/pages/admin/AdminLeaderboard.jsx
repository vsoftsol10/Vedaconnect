import { useEffect, useState } from "react";
import { Loader2, Trophy } from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import PeriodHubFilter from "../../components/admin/PeriodHubFilter";
import { getAdminLeaderboard } from "../../services/adminService";
import { getHubs } from "../../services/hubService";
import { usePeriodRange } from "../../hooks/usePeriodRange";
import Pagination, { usePagination } from "../../components/ui/Pagination";
import Table, { Cell, HeaderCell } from "../../components/ui/Table";

const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(amount || 0));

const LeaderboardTable = ({ rows }) => {
  const [page, setPage] = useState(1); const [rowsPerPage, setRowsPerPage] = useState(10);
  const visibleRows = usePagination(rows, page, rowsPerPage);
  useEffect(() => setPage(1), [rows, rowsPerPage]);
  return <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6"><h2 className="mb-4 font-bold text-gray-900">Member Leaderboard</h2><Table minWidth="min-w-[760px]"><thead><tr><HeaderCell align="center">Rank</HeaderCell><HeaderCell>Member</HeaderCell><HeaderCell>Hub</HeaderCell><HeaderCell align="right">Referrals given</HeaderCell><HeaderCell align="right">Business received</HeaderCell></tr></thead><tbody>{rows.length ? visibleRows.map((row, index) => <tr key={row.userId}><Cell align="center"><span className="font-bold text-gray-900">{(page - 1) * rowsPerPage + index + 1}</span></Cell><Cell title={`${row.fullName} ${row.businessName || ""}`}><p className="font-semibold text-gray-900">{row.fullName}</p><p className="text-xs text-gray-400">{row.businessName || "-"}</p></Cell><Cell title={row.hubName}>{row.hubName || "-"}</Cell><Cell align="right"><p className="font-bold text-gray-900">{row.referralCount}</p><p className="text-xs text-green-700">{formatCurrency(row.referralAmount)}</p></Cell><Cell align="right"><p className="font-bold text-gray-900">{row.businessCount}</p><p className="text-xs text-green-700">{formatCurrency(row.businessAmount)}</p></Cell></tr>) : <tr><td colSpan={5} className="vc-cell text-center text-gray-400">No entries yet.</td></tr>}</tbody></Table><Pagination page={page} onPageChange={setPage} rowsPerPage={rowsPerPage} onRowsPerPageChange={(value) => { setRowsPerPage(value); setPage(1); }} total={rows.length} /></div>;
};

const AdminLeaderboard = () => {
  const periodState = usePeriodRange(); const [hub, setHub] = useState("all"); const [sort, setSort] = useState("business"); const [hubs, setHubs] = useState([]); const [leaderboard, setLeaderboard] = useState({ rows: [] }); const [isLoading, setIsLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { const load = async () => { setIsLoading(true); setError(""); const [leaderboardData, hubRows] = await Promise.all([getAdminLeaderboard({ period: periodState.period, value: periodState.range.value, hub, sort }), getHubs()]); setLeaderboard(leaderboardData); setHubs(hubRows); setIsLoading(false); }; load().catch((err) => { setError(err.message); setIsLoading(false); }); }, [periodState.period, periodState.range.value, hub, sort]);
  return <div className="flex min-h-screen bg-stone-50"><AdminSidebar /><div className="min-w-0 flex-1"><AdminHeader title="Awards & Leaderboard" /><main className="px-4 py-6 sm:px-6 md:p-8"><div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div><div className="flex items-center gap-2"><Trophy className="h-6 w-6 text-amber-500" /><h1 className="text-2xl font-bold text-gray-900">Awards & Leaderboard</h1></div><p className="mt-1 text-gray-500">Recognize member achievement through referrals and business growth.</p></div><PeriodHubFilter periodState={periodState} hub={hub} onHubChange={setHub} hubs={hubs} sort={sort} onSortChange={setSort} /></div>{error && <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">{error}</div>}{isLoading ? <div className="flex items-center gap-2 text-gray-500"><Loader2 className="h-5 w-5 animate-spin" />Loading awards</div> : <LeaderboardTable rows={leaderboard.rows || []} />}</main></div></div>;
};

export default AdminLeaderboard;
