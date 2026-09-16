import { useEffect, useState } from "react";
import { Users, Building2, Calendar, IndianRupee, TrendingUp } from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import { getAdminDashboard } from "../../services/adminService";
import Table, { Cell, HeaderCell } from "../../components/ui/Table";
import { Avatar } from "../../components/ui/Avatar";
import Pagination, { usePagination } from "../../components/ui/Pagination";

const StatCard = ({ icon: Icon, iconBg, value, label, trend }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <span className={`h-11 w-11 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon className="h-5 w-5" />
      </span>
      <TrendingUp className="h-4 w-4 text-green-500" />
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-sm font-medium text-gray-700 mt-1">{label}</p>
    {trend && <p className="text-xs text-gray-400 mt-0.5">{trend}</p>}
  </div>
);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [recentPage, setRecentPage] = useState(1);
  const [recentRows, setRecentRows] = useState(10);

  useEffect(() => { getAdminDashboard().then(setData); }, []);

  if (!data) return null;

  const { stats, membersByHub, recentMembers, eventRegistrations } = data;
  const visibleRecent = usePagination(recentMembers, recentPage, recentRows);

  return (
    <div className="flex min-h-screen bg-stone-50">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <AdminHeader />
        <main className="px-4 py-6 sm:px-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h2>
          <p className="text-gray-500 mb-6">Community overview at a glance.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatCard icon={Users} iconBg="bg-amber-50 text-amber-600" value={stats.totalMembers} label="Total Members" />
            <StatCard icon={Building2} iconBg="bg-green-50 text-green-600" value={stats.totalHubs} label="Total Hubs" trend="Based on member locations" />
            <StatCard icon={Calendar} iconBg="bg-blue-50 text-blue-600" value={stats.upcomingEvents} label="Upcoming Events" />
            <StatCard icon={IndianRupee} iconBg="bg-amber-50 text-amber-600" value={`₹${stats.totalRevenue.toLocaleString("en-IN")}`} label="Total Revenue" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="overflow-hidden bg-white border border-gray-100 rounded-2xl shadow-sm">
              <h3 className="px-4 pt-4 font-bold text-gray-900 mb-1 sm:px-6 sm:pt-6">Members by Hub</h3>
              <p className="px-4 text-sm text-gray-400 mb-4 sm:px-6">Distribution across active hubs</p>
              <Table><thead><tr><HeaderCell>Hub</HeaderCell><HeaderCell align="right">Members</HeaderCell></tr></thead><tbody>{membersByHub.map(({ hub, count }) => <tr key={hub}><Cell title={hub}>{hub}</Cell><Cell align="right"><span className="font-bold text-gray-900">{count}</span></Cell></tr>)}</tbody></Table>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
              <h3 className="font-bold text-gray-900 mb-4">Recently Joined Members</h3>
              <Table minWidth="min-w-[640px]"><thead><tr><HeaderCell>Member</HeaderCell><HeaderCell>Business</HeaderCell><HeaderCell>Hub</HeaderCell><HeaderCell align="center">Joined</HeaderCell></tr></thead><tbody>{visibleRecent.map((m) => <tr key={m.userId}><Cell title={m.fullName}><div className="flex items-center gap-2"><Avatar name={m.fullName} src={m.profilePhoto} className="h-8 w-8" /><span className="font-medium text-gray-900">{m.fullName}</span></div></Cell><Cell title={m.businessName}>{m.businessName || "-"}</Cell><Cell title={m.hub}>{m.hub || "-"}</Cell><Cell align="center">{new Date(m.joinedAt).toLocaleDateString("en-IN")}</Cell></tr>)}</tbody></Table>
              <Pagination page={recentPage} onPageChange={setRecentPage} rowsPerPage={recentRows} onRowsPerPageChange={(value) => { setRecentRows(value); setRecentPage(1); }} total={recentMembers.length} />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
            <h3 className="font-bold text-gray-900 mb-1">Event Registrations</h3>
            <p className="text-sm text-gray-400 mb-4">Upcoming events and registration counts</p>
            <Table minWidth="min-w-[720px]">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase">
                  <th className="pb-2">Event</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Hub</th>
                  <th className="pb-2">Registered Members</th>
                  <th className="pb-2">Event Fee</th>
                </tr>
              </thead>
              <tbody>
                {eventRegistrations.map((e) => (
                  <tr key={e.id} className="border-t border-gray-50">
                    <td className="py-3 font-medium text-gray-900">{e.title}</td>
                    <td className="py-3 text-gray-600">{new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td className="py-3 text-gray-600">{e.location}</td>
                    <td className="py-3 font-semibold text-gray-900">{e.registeredCount}</td>
                    <td className="py-3 text-gray-600">{e.fee === 0 ? "Free" : `₹${e.fee}`}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
