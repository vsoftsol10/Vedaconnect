import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, User, Building2, Crown, FileText, Calendar, CreditCard, Eye } from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import { getAdminMemberDetail, assignMemberHub, listAdminHubs, updateMemberJoinedDate } from "../../services/adminService";

const formatDisplayDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-";

const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const AdminMemberDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [hubs, setHubs] = useState([]);
  const [isSavingHub, setIsSavingHub] = useState(false);
  const [isSavingJoinedDate, setIsSavingJoinedDate] = useState(false);

  const load = () => getAdminMemberDetail(userId).then(setMember);

  useEffect(() => { load(); listAdminHubs().then(setHubs); }, [userId]);

  const handleHubChange = async (e) => {
    setIsSavingHub(true);
    try {
      await assignMemberHub(userId, e.target.value || null);
      await load();
    } finally {
      setIsSavingHub(false);
    }
  };

  const handleJoinedDateChange = async (e) => {
    if (!e.target.value) return;
    setIsSavingJoinedDate(true);
    try {
      await updateMemberJoinedDate(userId, e.target.value);
      await load();
    } finally {
      setIsSavingJoinedDate(false);
    }
  };

  if (!member) return null;

  const isLifetime = member.billingCycle?.toUpperCase().includes("LIFETIME");
  const renewalDateLabel = isLifetime
    ? "Lifetime"
    : member.expiresAt
      ? formatDisplayDate(member.expiresAt)
      : "-";

  return (
    <div className="flex min-h-screen bg-stone-50">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <AdminHeader title="Member Details" />
        <main className="px-4 py-6 sm:px-6 md:p-8">
          <button onClick={() => navigate("/admin/members")} className="flex items-center gap-2 text-gray-500 hover:text-green-600 font-medium mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Members
          </button>

          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-6 shadow-sm">
            <div className="h-24 bg-gradient-to-r from-amber-100 to-green-50" />
            <div className="px-6 pb-6 -mt-10 flex items-end justify-between flex-wrap gap-4">
              <div className="flex items-end gap-4">
                {member.profilePhoto ? (
                  <img src={member.profilePhoto} className="h-20 w-20 rounded-2xl object-cover border-4 border-white" alt="" />
                ) : (
                  <div className="h-20 w-20 rounded-2xl bg-amber-100 border-4 border-white flex items-center justify-center text-2xl font-bold text-amber-700">
                    {member.fullName?.[0]}
                  </div>
                )}
                <div className="pb-1">
                  <h1 className="text-xl font-bold text-gray-900">{member.fullName}</h1>
                  <p className="text-sm text-gray-500">{member.businessName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-50 text-amber-700 text-sm font-medium px-3 py-1.5 rounded-full">{member.businessCategory}</span>
                <span className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full ${member.membershipStatus === "ACTIVE" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${member.membershipStatus === "ACTIVE" ? "bg-green-500" : "bg-gray-300"}`} />
                  {member.membershipStatus?.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="flex items-center gap-2 font-bold text-gray-900 mb-4"><User className="h-5 w-5 text-green-600" /> Personal Details</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Name" value={member.fullName} />
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Hub</p>
                  <select
                    value={member.hub?.id || ""}
                    onChange={handleHubChange}
                    disabled={isSavingHub}
                    className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-green-500 disabled:opacity-50"
                  >
                    <option value="">Not assigned</option>
                    {hubs.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>
                <Field label="Location" value={member.location} />
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="flex items-center gap-2 font-bold text-gray-900 mb-4"><Building2 className="h-5 w-5 text-green-600" /> Business Details</h3>
              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Business Name" value={member.businessName} />
                <Field label="Category" value={member.businessCategory} />
              </div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Description</p>
              <p className="text-sm text-gray-700">{member.businessDescription}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="flex items-center gap-2 font-bold text-gray-900 mb-4"><Crown className="h-5 w-5 text-amber-500" /> Membership</h3>
              <Field label="Plan" value={member.membershipType?.replace("_", " ")} bold />
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Joined Date</p>
                  <input
                    type="date"
                    value={toDateInputValue(member.joinedAt)}
                    onChange={handleJoinedDateChange}
                    disabled={isSavingJoinedDate}
                    className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-green-500 disabled:opacity-50"
                  />
                </div>
                <Field label="Renewal Date" value={renewalDateLabel} bold />
              </div>
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Status</p>
                <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${member.membershipStatus === "ACTIVE" ? "text-green-600" : "text-gray-400"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${member.membershipStatus === "ACTIVE" ? "bg-green-500" : "bg-gray-300"}`} />
                  {member.membershipStatus?.replace("_", " ")}
                </span>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="flex items-center gap-2 font-bold text-gray-900 mb-4"><FileText className="h-5 w-5 text-green-600" /> Certificate</h3>
              {member.certificates.length > 0 ? member.certificates.map((cert) => (
                <div key={cert.id} className="mb-3">
                  <p className="font-medium text-gray-900 text-sm mb-1">{cert.fileName}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cert.isVerified ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"}`}>
                    {cert.isVerified ? "Verified" : "Pending Review"}
                  </span>
                  <a href={cert.signedUrl} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-green-600 border border-gray-200 rounded-lg px-3 py-1.5 w-fit">
                    <Eye className="h-3.5 w-3.5" /> View Certificate
                  </a>
                </div>
              )) : <p className="text-sm text-gray-400">No certificate uploaded.</p>}
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="flex items-center gap-2 font-bold text-gray-900 mb-4"><Calendar className="h-5 w-5 text-green-600" /> Event Registrations</h3>
              {member.eventRegistrations.length > 0 ? member.eventRegistrations.map((r) => (
                <div key={r.id} className="bg-gray-50 rounded-xl px-3 py-2 mb-2">
                  <p className="text-sm font-medium text-gray-900">{r.eventTitle}</p>
                  <p className="text-xs text-gray-400">{new Date(r.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {r.hub}</p>
                </div>
              )) : <p className="text-sm text-gray-400">No events registered yet.</p>}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm overflow-x-auto">
            <h3 className="flex items-center gap-2 font-bold text-gray-900 mb-4"><CreditCard className="h-5 w-5 text-green-600" /> Payment History</h3>
            {member.paymentHistory.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-100">
                    <th className="pb-2">Type</th><th className="pb-2">Item</th><th className="pb-2">Amount</th><th className="pb-2">Date</th><th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {member.paymentHistory.map((p, i) => (
                    <tr key={i} className="border-b border-gray-50 last:border-0">
                      <td className="py-3 text-gray-600">{p.type}</td>
                      <td className="py-3 font-medium text-gray-900">{p.item}</td>
                      <td className="py-3 text-gray-900">₹{p.amount.toLocaleString("en-IN")}</td>
                      <td className="py-3 text-gray-400">{new Date(p.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                      <td className="py-3"><span className="text-green-600 text-xs font-medium">{p.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="text-sm text-gray-400">No payments recorded.</p>}
          </div>
        </main>
      </div>
    </div>
  );
};

const Field = ({ label, value, bold }) => (
  <div>
    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">{label}</p>
    <p className={bold ? "font-bold text-gray-900" : "text-gray-900"}>{value || "-"}</p>
  </div>
);

export default AdminMemberDetail;
