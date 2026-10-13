import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Trophy } from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import PeriodHubFilter from "../../components/admin/PeriodHubFilter";
import ManualWeeklyAwardModal from "../../components/admin/ManualWeeklyAwardModal";
import { getAdminLeaderboard, listAdminMembers } from "../../services/adminService";
import { getHubs } from "../../services/hubService";
import { dateKey, startOfWeek, usePeriodRange } from "../../hooks/usePeriodRange";
import Pagination, { usePagination } from "../../components/ui/Pagination";
import Table, { Cell, HeaderCell } from "../../components/ui/Table";

const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(amount || 0));
const formatDate = (value) => new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(value));

const LeaderboardTable = ({ rows }) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const visibleRows = usePagination(rows, page, rowsPerPage);
  useEffect(() => setPage(1), [rows, rowsPerPage]);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="mb-4 font-bold text-gray-900">Member Leaderboard</h2>
      <Table minWidth="min-w-[760px]">
        <thead><tr><HeaderCell align="center">Rank</HeaderCell><HeaderCell>Member</HeaderCell><HeaderCell>Hub</HeaderCell><HeaderCell align="right">Business Giver (₹)</HeaderCell><HeaderCell align="right">Business Achiever (₹)</HeaderCell></tr></thead>
        <tbody>
          {rows.length ? visibleRows.map((row, index) => (
            <tr key={row.userId}>
              <Cell align="center"><span className="font-bold text-gray-900">{(page - 1) * rowsPerPage + index + 1}</span></Cell>
              <Cell title={`${row.fullName} ${row.businessName || ""}`}><p className="font-semibold text-gray-900">{row.fullName}</p><p className="text-xs text-gray-400">{row.businessName || "-"}</p></Cell>
              <Cell title={row.hubName}>{row.hubName || "-"}</Cell>
              <Cell align="right"><p className="font-bold text-gray-900">{formatCurrency(row.referralAmount)}</p></Cell>
              <Cell align="right"><p className="font-bold text-gray-900">{formatCurrency(row.businessAmount)}</p></Cell>
            </tr>
          )) : <tr><td colSpan={5} className="vc-cell text-center text-gray-400">No entries yet.</td></tr>}
        </tbody>
      </Table>
      <Pagination page={page} onPageChange={setPage} rowsPerPage={rowsPerPage} onRowsPerPageChange={(next) => { setRowsPerPage(next); setPage(1); }} total={rows.length} />
    </div>
  );
};

const ManualAwardEntriesTable = ({ rows }) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const visibleRows = usePagination(rows, page, rowsPerPage);
  useEffect(() => setPage(1), [rows, rowsPerPage]);

  return (
    <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="mb-4 font-bold text-gray-900">Manual Award Entries</h2>
      <Table minWidth="min-w-[760px]">
        <thead><tr><HeaderCell>Member</HeaderCell><HeaderCell>Hub</HeaderCell><HeaderCell>Week starts</HeaderCell><HeaderCell align="right">Business Giver (₹)</HeaderCell><HeaderCell align="right">Business Achiever (₹)</HeaderCell></tr></thead>
        <tbody>
          {rows.length ? visibleRows.map((row) => (
            <tr key={`${row.userId}-${row.weekStart}`}>
              <Cell><p className="font-semibold text-gray-900">{row.fullName}</p><p className="text-xs text-gray-400">{row.businessName || "-"}</p></Cell>
              <Cell>{row.hubName || "-"}</Cell>
              <Cell>{formatDate(row.weekStart)}</Cell>
              <Cell align="right"><p className="font-bold text-gray-900">{formatCurrency(row.referralAmount)}</p></Cell>
              <Cell align="right"><p className="font-bold text-gray-900">{formatCurrency(row.businessAmount)}</p></Cell>
            </tr>
          )) : <tr><td colSpan={5} className="vc-cell text-center text-gray-400">No manual entries for this period and hub. Try the previous week to find earlier entries.</td></tr>}
        </tbody>
      </Table>
      <Pagination page={page} onPageChange={setPage} rowsPerPage={rowsPerPage} onRowsPerPageChange={(next) => { setRowsPerPage(next); setPage(1); }} total={rows.length} />
    </div>
  );
};

const getEntryWeekStart = (periodState) => {
  const start = new Date(periodState.range.start);
  let saturday = startOfWeek(start);
  if (saturday < start) {
    saturday.setDate(saturday.getDate() + 7);
  }
  return dateKey(saturday);
};

const AdminLeaderboard = () => {
  const periodState = usePeriodRange();
  const [hub, setHub] = useState("all");
  const [sort, setSort] = useState("business");
  const [hubs, setHubs] = useState([]);
  const [members, setMembers] = useState([]);
  const [leaderboard, setLeaderboard] = useState({ rows: [], manualEntries: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [manualEntryOpen, setManualEntryOpen] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const [leaderboardData, hubRows, memberRows] = await Promise.all([
        getAdminLeaderboard({ period: periodState.period, value: periodState.range.value, hub, sort }),
        getHubs(),
        listAdminMembers(),
      ]);
      setLeaderboard(leaderboardData);
      setHubs(hubRows);
      setMembers(memberRows);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [periodState.period, periodState.range.value, hub, sort]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="flex min-h-screen bg-stone-50">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <AdminHeader title="Awards & Leaderboard" />
        <main className="px-4 py-6 sm:px-6 md:p-8">
          <div className="mb-6">
            <div>
              <div className="flex items-center gap-2"><Trophy className="h-6 w-6 text-amber-500" /><h1 className="text-2xl font-bold text-gray-900">Awards & Leaderboard</h1></div>
              <p className="mt-1 text-gray-500">Recognize member achievement through referrals and business growth.</p>
            </div>
            <div className="mt-5 flex flex-col gap-3">
              <PeriodHubFilter periodState={periodState} hub={hub} onHubChange={setHub} hubs={hubs} sort={sort} onSortChange={setSort} />
              <button type="button" onClick={() => setManualEntryOpen(true)} className="inline-flex min-h-11 self-start items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 text-sm font-semibold text-gray-900 hover:bg-amber-300">
                <Plus className="h-4 w-4" /> Manual weekly entry
              </button>
            </div>
          </div>
          {error && <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">{error}</div>}
          {isLoading ? <div className="flex items-center gap-2 text-gray-500"><Loader2 className="h-5 w-5 animate-spin" />Loading awards</div> : (
            <>
              <ManualAwardEntriesTable rows={leaderboard.manualEntries || []} />
              <LeaderboardTable rows={leaderboard.rows || []} />
            </>
          )}
        </main>
      </div>
      <ManualWeeklyAwardModal
        isOpen={manualEntryOpen}
        onClose={() => setManualEntryOpen(false)}
        onSaved={() => { setManualEntryOpen(false); load(); }}
        members={members}
        hubs={hubs}
        weekStart={getEntryWeekStart(periodState)}
      />
    </div>
  );
};

export default AdminLeaderboard;
