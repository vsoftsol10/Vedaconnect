import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import AddMemberModal from "../../components/admin/AddMemberModal";
import { listAdminMembers, listAdminHubs } from "../../services/adminService";
import { suspendMember, reactivateMember, deleteMember } from "../../services/adminService";
import MemberActionMenu from "../../components/admin/MemberActionMenu";
import MemberConfirmModal from "../../components/admin/MemberConfirmModal";
import EditMemberModal from "../../components/admin/EditMemberModal";

const STATUS_OPTIONS = ["PENDING_PAYMENT", "ACTIVE", "SUSPENDED", "CANCELLED"];

const AdminMembers = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [search, setSearch] = useState("");
  const [hubId, setHubId] = useState("");
  const [status, setStatus] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [isActing, setIsActing] = useState(false);

  useEffect(() => { listAdminHubs().then(setHubs); }, []);

  const refreshMembers = () => listAdminMembers({ search, hubId, status }).then(setMembers);

  useEffect(() => {
    const timeout = setTimeout(refreshMembers, 300);
    return () => clearTimeout(timeout);
  }, [search, hubId, status]);

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
            <select value={hubId} onChange={(e) => setHubId(e.target.value)} className="min-h-11 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none sm:w-auto">
              <option value="">All Hubs</option>
              {hubs.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="min-h-11 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none sm:w-auto">
              <option value="">All Status</option>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>
          </div>

          <p className="text-sm text-gray-500 mb-3">
            <strong className="text-gray-900">{members.length}</strong> members found
          </p>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-100">
                  <th className="px-6 py-4">Member</th>
                  <th className="px-6 py-4">Business</th>
                  <th className="px-6 py-4">Hub</th>
                  <th className="px-6 py-4">Membership</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.userId} className="border-b border-gray-50 last:border-0">
                    <td className="px-6 py-4 flex items-center gap-3">
                      {m.profilePhoto ? (
                        <img src={m.profilePhoto} className="h-9 w-9 rounded-full object-cover" alt="" />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center text-xs font-semibold text-amber-700">
                          {m.fullName?.[0]}
                        </div>
                      )}
                      <span className="font-medium text-gray-900">{m.fullName}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{m.businessName}</td>
                    <td className="px-6 py-4 text-gray-600">{m.hub}</td>
                    <td className="px-6 py-4">
                      <span className="bg-amber-50 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full">
                        {m.membershipType?.replace("_", " ") || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span title={m.membershipStatus === "SUSPENDED" && m.autoDeleteAt ? `Auto-deletes on ${new Date(m.autoDeleteAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` : undefined} className={`flex items-center gap-1.5 text-xs font-medium ${statusStyle(m).split(" ")[0]}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusStyle(m).split(" ")[1]}`} />
                        {m.membershipStatus?.replace("_", " ") || "-"}
                      </span>
                      {m.membershipStatus === "SUSPENDED" && m.autoDeleteAt && <p className="mt-1 text-[11px] text-red-500">Auto-deletes {new Date(m.autoDeleteAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>}
                    </td>
                    <td className="px-6 py-4 text-gray-400">{m.joinedAt ? new Date(m.joinedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-"}</td>
                    <td className="px-6 py-4"><MemberActionMenu member={m} onView={() => navigate(`/admin/members/${m.userId}`)} onEdit={() => setEditingMember(m)} onSuspend={() => setConfirmation({ type: "suspend", member: m })} onReactivate={() => reactivate(m)} onDelete={() => setConfirmation({ type: "delete", member: m })} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
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
