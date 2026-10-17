import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Ellipsis, Eye, Loader2, Pencil, Plus, Trash2, Trophy, X } from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import PeriodHubFilter from "../../components/admin/PeriodHubFilter";
import ManualWeeklyAwardModal from "../../components/admin/ManualWeeklyAwardModal";
import { deleteManualWeeklyAward, getAdminLeaderboard, listAdminMembers } from "../../services/adminService";
import { getHubs } from "../../services/hubService";
import { dateKey, startOfWeek, usePeriodRange } from "../../hooks/usePeriodRange";
import Pagination, { usePagination } from "../../components/ui/Pagination";
import Table, { Cell, HeaderCell } from "../../components/ui/Table";

const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(amount || 0));
const formatDate = (value) => new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(value));

const ManualAwardActionsMenu = ({ row, onView, onEdit, onDelete }) => {
  const [position, setPosition] = useState(null);
  const openMenu = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    setPosition({
      top: Math.max(8, Math.min(bounds.bottom, window.innerHeight - 140)),
      right: Math.max(8, window.innerWidth - bounds.right),
    });
  };
  const choose = (action) => {
    setPosition(null);
    action(row);
  };

  return (
    <>
      <button type="button" aria-label={`Actions for ${row.fullName}`} aria-haspopup="menu" aria-expanded={Boolean(position)} onClick={openMenu} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-300">
        <Ellipsis className="h-5 w-5" />
      </button>
      {position && createPortal(
        <>
          <button type="button" aria-label="Close actions menu" onClick={() => setPosition(null)} className="fixed inset-0 z-40 cursor-default" />
          <div role="menu" aria-label={`Actions for ${row.fullName}`} style={position} className="fixed z-50 w-36 rounded-xl border border-gray-100 bg-white p-1 text-left shadow-lg">
            <button type="button" role="menuitem" onClick={() => choose(onView)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Eye className="h-4 w-4" />View</button>
            <button type="button" role="menuitem" onClick={() => choose(onEdit)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Pencil className="h-4 w-4" />Edit</button>
            <button type="button" role="menuitem" onClick={() => choose(onDelete)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" />Delete</button>
          </div>
        </>,
        document.body,
      )}
    </>
  );
};

const WeeklyAwardWinnersTable = ({ rows }) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const visibleRows = usePagination(rows, page, rowsPerPage);
  useEffect(() => setPage(1), [rows, rowsPerPage]);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="font-bold text-gray-900">Weekly Award Winners</h2>
      <p className="mb-4 mt-1 text-sm text-gray-500">Top Business Giver and Business Achiever for each week in the selected period.</p>
      <Table minWidth="min-w-[720px]">
        <thead><tr><HeaderCell>Week starts</HeaderCell><HeaderCell>Award</HeaderCell><HeaderCell>Winner</HeaderCell><HeaderCell>Hub</HeaderCell><HeaderCell align="right">Winning value</HeaderCell></tr></thead>
        <tbody>
          {rows.length ? visibleRows.map((row) => (
            <tr key={`${row.weekStart}-${row.activityType}-${row.userId}`}>
              <Cell>{formatDate(row.weekStart)}</Cell>
              <Cell><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.activityType === "Business Giver" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}`}>{row.activityType}</span></Cell>
              <Cell title={`${row.fullName} ${row.businessName || ""}`}><p className="font-semibold text-gray-900">{row.fullName}</p><p className="text-xs text-gray-400">{row.businessName || "-"}</p></Cell>
              <Cell title={row.hubName}>{row.hubName || "-"}</Cell>
              <Cell align="right"><p className="font-bold text-gray-900">{formatCurrency(row.amount)}</p></Cell>
            </tr>
          )) : <tr><td colSpan={5} className="vc-cell text-center text-gray-400">No weekly award winners in this period.</td></tr>}
        </tbody>
      </Table>
      <Pagination page={page} onPageChange={setPage} rowsPerPage={rowsPerPage} onRowsPerPageChange={(next) => { setRowsPerPage(next); setPage(1); }} total={rows.length} />
    </div>
  );
};

const ActivityEntriesTable = ({ rows, onView, onEdit, onDelete }) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const visibleRows = usePagination(rows, page, rowsPerPage);
  useEffect(() => setPage(1), [rows, rowsPerPage]);

  return (
    <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="font-bold text-gray-900">Award Activity Details</h2>
      <p className="mb-4 mt-1 text-sm text-gray-500">Member portal logs and admin weekly entries for the selected period. Admin entries replace portal totals for the same member and week in the winners calculation.</p>
      <Table minWidth="min-w-[1220px]">
        <thead><tr><HeaderCell>Member</HeaderCell><HeaderCell>Hub</HeaderCell><HeaderCell>Week starts</HeaderCell><HeaderCell>Logged on</HeaderCell><HeaderCell>Activity / details</HeaderCell><HeaderCell align="right">Business Giver (₹)</HeaderCell><HeaderCell align="right">Business Achiever (₹)</HeaderCell><HeaderCell>Source</HeaderCell><HeaderCell align="right" className="w-20">Actions</HeaderCell></tr></thead>
        <tbody>
          {rows.length ? visibleRows.map((row) => (
            <tr key={row.id}>
              <Cell><p className="font-semibold text-gray-900">{row.fullName}</p><p className="text-xs text-gray-400">{row.businessName || "-"}</p></Cell>
              <Cell>{row.hubName || "-"}</Cell>
              <Cell>{formatDate(row.weekStart)}</Cell>
              <Cell>{formatDate(row.createdAt)}</Cell>
              <Cell title={row.details}><p className="font-medium text-gray-900">{row.activityType}</p><p className="max-w-64 truncate text-xs text-gray-400">{row.details || "-"}</p></Cell>
              <Cell align="right"><p className="font-bold text-gray-900">{row.isManual || row.referralAmount ? formatCurrency(row.referralAmount) : "-"}</p></Cell>
              <Cell align="right"><p className="font-bold text-gray-900">{row.isManual || row.businessAmount ? formatCurrency(row.businessAmount) : "-"}</p></Cell>
              <Cell><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.isManual ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-600"}`}>{row.source}</span></Cell>
              <Cell align="right" className="w-20">
                {row.isManual ? <ManualAwardActionsMenu row={row} onView={onView} onEdit={onEdit} onDelete={onDelete} /> : "-"}
              </Cell>
            </tr>
          )) : <tr><td colSpan={9} className="vc-cell text-center text-gray-400">No award activity found in this period.</td></tr>}
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
  const periodState = usePeriodRange("year");
  const [hub, setHub] = useState("all");
  const [hubs, setHubs] = useState([]);
  const [members, setMembers] = useState([]);
  const [leaderboard, setLeaderboard] = useState({ winners: [], activityEntries: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [manualEntryOpen, setManualEntryOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [viewingEntry, setViewingEntry] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const [leaderboardData, hubRows, memberRows] = await Promise.all([
        getAdminLeaderboard({ period: periodState.period, value: periodState.range.value, hub }),
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
  }, [periodState.period, periodState.range.value, hub]);

  useEffect(() => { load(); }, [load]);

  const saveEntry = (savedEntry) => {
    setManualEntryOpen(false);
    setEditingEntry(null);
    const date = new Date(`${savedEntry.weekStart}T00:00:00`);
    const isVisibleInPeriod = date >= periodState.range.start && date < periodState.range.end;
    const isVisibleInHub = hub === "all" || hub === savedEntry.hubId;
    if (!isVisibleInHub) setHub(savedEntry.hubId);
    if (!isVisibleInPeriod) periodState.goToDate(date);
    if (isVisibleInHub && isVisibleInPeriod) load();
  };

  const removeEntry = async (entry) => {
    if (!window.confirm(`Delete the manual award entry for ${entry.fullName}?`)) return;
    setError("");
    try {
      await deleteManualWeeklyAward(entry.id);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Could not delete the award entry.");
    }
  };

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
              <PeriodHubFilter periodState={periodState} hub={hub} onHubChange={setHub} hubs={hubs} />
              <button type="button" onClick={() => { setEditingEntry(null); setManualEntryOpen(true); }} className="inline-flex min-h-11 self-start items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 text-sm font-semibold text-gray-900 hover:bg-amber-300">
                <Plus className="h-4 w-4" /> Manual weekly entry
              </button>
            </div>
          </div>
          {error && <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">{error}</div>}
          {isLoading ? <div className="flex items-center gap-2 text-gray-500"><Loader2 className="h-5 w-5 animate-spin" />Loading awards</div> : (
            <>
              <ActivityEntriesTable
                rows={leaderboard.activityEntries || []}
                onView={setViewingEntry}
                onEdit={(entry) => { setEditingEntry(entry); setManualEntryOpen(true); }}
                onDelete={removeEntry}
              />
              <WeeklyAwardWinnersTable rows={leaderboard.winners || []} />
            </>
          )}
        </main>
      </div>
      <ManualWeeklyAwardModal
        isOpen={manualEntryOpen}
        onClose={() => { setManualEntryOpen(false); setEditingEntry(null); }}
        onSaved={saveEntry}
        members={members}
        hubs={hubs}
        weekStart={getEntryWeekStart(periodState)}
        entry={editingEntry}
      />
      {viewingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setViewingEntry(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="award-entry-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div><h2 id="award-entry-title" className="text-lg font-bold text-gray-900">Manual award entry</h2><p className="mt-1 text-sm text-gray-500">{viewingEntry.fullName}</p></div>
              <button type="button" onClick={() => setViewingEntry(null)} aria-label="Close" className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-gray-500">Business</dt><dd className="text-right font-medium text-gray-900">{viewingEntry.businessName || "-"}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-gray-500">Hub</dt><dd className="text-right font-medium text-gray-900">{viewingEntry.hubName || "-"}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-gray-500">Week starts</dt><dd className="text-right font-medium text-gray-900">{formatDate(viewingEntry.weekStart)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-gray-500">Business Giver</dt><dd className="text-right font-medium text-gray-900">{formatCurrency(viewingEntry.referralAmount)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-gray-500">Business Achiever</dt><dd className="text-right font-medium text-gray-900">{formatCurrency(viewingEntry.businessAmount)}</dd></div>
            </dl>
          </section>
        </div>
      )}
    </div>
  );
};

export default AdminLeaderboard;
