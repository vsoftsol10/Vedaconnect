import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import AddMemberModal from "../../components/admin/AddMemberModal";
import { listAdminMembers, listAdminHubs } from "../../services/adminService";
import { suspendMember, reactivateMember, deleteMember, resendMemberCredentials } from "../../services/adminService";
import MemberActionMenu from "../../components/admin/MemberActionMenu";
import MemberConfirmModal from "../../components/admin/MemberConfirmModal";
import EditMemberModal from "../../components/admin/EditMemberModal";
import Dropdown from "../../components/ui/Dropdown";
import Pagination, { usePagination } from "../../components/ui/Pagination";
import Table, { Cell, HeaderCell } from "../../components/ui/Table";
import { Avatar } from "../../components/ui/Avatar";

const STATUS_OPTIONS = ["PENDING_PAYMENT", "ACTIVE", "SUSPENDED", "CANCELLED"];
const TIER_OPTIONS = ["FOUNDING_MEMBER", "MEMBER"];

const AdminMembers = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [search, setSearch] = useState("");
  const [hubId, setHubId] = useState("");
  const [status, setStatus] = useState("");
  const [membershipTier, setMembershipTier] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [isActing, setIsActing] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => { listAdminHubs().then(setHubs); }, []);

  const refreshMembers = () => listAdminMembers({ search, hubId, status, membershipTier }).then(setMembers);

  useEffect(() => {
    const timeout = setTimeout(refreshMembers, 300);
    return () => clearTimeout(timeout);
  }, [search, hubId, status, membershipTier]);
  useEffect(() => { setPage(1); }, [search, hubId, status, membershipTier, rowsPerPage]);
  const visibleMembers = usePagination(members, page, rowsPerPage);

  const confirmAction = async () => {
    if (!confirmation) return;
    setIsActing(true);
    try {
      if (confirmation.type === "suspend") await suspendMember(confirmation.member.userId);
      else await deleteMember(confirmation.member.userId);
      setConfirmation(null);
      refreshMembers();
    } finally { setIsActing(false); }
  };

  const reactivate = async (member) => {
    await reactivateMember(member.userId);
    refreshMembers();
  };
  const resendCredentials = async (member) => {
    await resendMemberCredentials(member.userId);
    refreshMembers();
  };

  const statusStyle = (member) => {
    if (member.membershipStatus === "ACTIVE") return "text-green-600 bg-green-500";
    if (member.membershipStatus === "SUSPENDED") return "text-red-600 bg-red-500";
    return "text-gray-500 bg-gray-300";
  };

  return (
    <div className="flex min-h-screen bg-stone-50">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <AdminHeader title="Members" />
        <main className="px-4 py-6 sm:px-6 md:p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Members</h2>
              <p className="text-gray-500">Manage all VedaConnect community members.</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex min-h-11 items-center justify-center gap-2 bg-amber-400 hover:bg-green-600 hover:text-white text-gray-900 font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              <Plus className="h-4 w-4" /> Add Member
            </button>
          </div>

          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap">
            <div className="relative w-full flex-1 sm:min-w-[200px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search members"
                className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-2.5 text-sm outline-none focus:border-green-500"
              />
            </div>
            <Dropdown value={hubId} onChange={setHubId} placeholder="All Hubs" className="w-full sm:w-52" options={hubs.map((hub) => ({ value: hub.id, label: hub.name }))} />
            <Dropdown value={status} onChange={setStatus} placeholder="All Status" className="w-full sm:w-52" options={STATUS_OPTIONS.map((item) => ({ value: item, label: item.replace("_", " ") }))} />
            <Dropdown value={membershipTier} onChange={setMembershipTier} placeholder="All Tiers" className="w-full sm:w-52" options={TIER_OPTIONS.map((item) => ({ value: item, label: item === "FOUNDING_MEMBER" ? "Founding Member" : "Member" }))} />
          </div>

          <p className="text-sm text-gray-500 mb-3">
            <strong className="text-gray-900">{members.length}</strong> members found
          </p>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-x-auto">
            <Table minWidth="min-w-[900px]">
              <thead>
                <tr><HeaderCell>Member</HeaderCell><HeaderCell>Business</HeaderCell><HeaderCell>Hub</HeaderCell><HeaderCell>Membership</HeaderCell><HeaderCell>Tier</HeaderCell><HeaderCell align="center">Status</HeaderCell><HeaderCell align="center">Credentials</HeaderCell><HeaderCell align="center">Joined</HeaderCell><HeaderCell align="right">Action</HeaderCell>
                </tr>
              </thead>
              <tbody>
                {visibleMembers.map((m) => (
                  <tr key={m.userId}>
                    <Cell title={m.fullName}><div className="flex items-center gap-3"><Avatar src={m.profilePhoto} name={m.fullName} /><span className="font-medium text-gray-900">{m.fullName}</span></div></Cell>
                    <Cell title={m.businessName}>{m.businessName || "-"}</Cell><Cell title={m.hub}>{m.hub || "-"}</Cell>
                    <Cell>
                      <span className="bg-amber-50 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full">
                        {m.membershipType?.replace("_", " ") || "-"}
                      </span>
                    </Cell>
                    <Cell>{m.membershipTier ? <span className="bg-amber-50 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full">{m.membershipTier === "FOUNDING_MEMBER" ? "Founding Member" : "Member"}</span> : "-"}</Cell>
                    <Cell align="center"><span title={m.membershipStatus === "SUSPENDED" && m.autoDeleteAt ? `Auto-deletes on ${new Date(m.autoDeleteAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` : undefined} className={`inline-flex items-center gap-1.5 text-xs font-medium ${statusStyle(m).split(" ")[0]}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusStyle(m).split(" ")[1]}`} />
                        {m.membershipStatus?.replace("_", " ") || "-"}
                      </span>
                    </Cell>
                    <Cell align="center"><span className={`text-xs font-medium ${m.onboardingDeliveryStatus === "success" ? "text-green-600" : m.onboardingDeliveryStatus === "failed" ? "text-red-600" : "text-gray-500"}`}>{m.onboardingDeliveryStatus === "success" ? "Credentials sent" : m.onboardingDeliveryStatus === "failed" ? "Failed" : "Unknown-legacy"}</span></Cell>
                    <Cell align="center">{m.joinedAt ? new Date(m.joinedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-"}</Cell><Cell align="right"><MemberActionMenu member={m} onView={() => navigate(`/admin/members/${m.userId}`)} onEdit={() => setEditingMember(m)} onResendCredentials={() => resendCredentials(m)} onSuspend={() => setConfirmation({ type: "suspend", member: m })} onReactivate={() => reactivate(m)} onDelete={() => setConfirmation({ type: "delete", member: m })} /></Cell>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Pagination page={page} onPageChange={setPage} rowsPerPage={rowsPerPage} onRowsPerPageChange={setRowsPerPage} total={members.length} />
          </div>
        </main>
      </div>

      {showAddModal && (
        <AddMemberModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            refreshMembers();
          }}
        />
      )}
      {editingMember && <EditMemberModal member={editingMember} onClose={() => setEditingMember(null)} onSuccess={() => { setEditingMember(null); refreshMembers(); }} />}
      {confirmation && <MemberConfirmModal type={confirmation.type} member={confirmation.member} onClose={() => setConfirmation(null)} onConfirm={confirmAction} isSubmitting={isActing} />}
    </div>
  );
};

export default AdminMembers;
