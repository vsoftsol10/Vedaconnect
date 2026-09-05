import { useEffect, useState } from "react";
import { Eye, CheckCircle, XCircle, X } from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import {
  listMembershipPayments, verifyMembershipPayment, rejectMembershipPayment,
  listEventPayments, verifyEventPayment, rejectEventPayment,
} from "../../services/adminService";

const STATUS_STYLES = {
  PENDING: "bg-amber-50 text-amber-700",
  PAID: "bg-green-50 text-green-700",
  FAILED: "bg-red-50 text-red-600",
};
const STATUS_LABEL = { PENDING: "Pending", PAID: "Verified", FAILED: "Rejected" };
const INVOICE_EMAIL_STYLES = {
  SENT: "bg-green-50 text-green-700",
  PENDING: "bg-amber-50 text-amber-700",
  NOT_READY: "bg-gray-50 text-gray-500",
};
const INVOICE_EMAIL_LABEL = {
  SENT: "Invoice sent",
  PENDING: "Invoice pending",
  NOT_READY: "Not ready",
};

const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const AdminPaymentHistory = () => {
  const [tab, setTab] = useState("membership");
  const [membershipPayments, setMembershipPayments] = useState([]);
  const [eventPayments, setEventPayments] = useState([]);
  const [selected, setSelected] = useState(null);

  const load = () => {
    listMembershipPayments().then(setMembershipPayments);
    listEventPayments().then(setEventPayments);
  };
  useEffect(() => { load(); }, []);

  const handleVerify = async (row) => {
    if (tab === "membership") await verifyMembershipPayment(row.id);
    else await verifyEventPayment(row.id);
    setSelected(null);
    load();
  };

  const handleReject = async (row) => {
    if (tab === "membership") await rejectMembershipPayment(row.id);
    else await rejectEventPayment(row.id);
    setSelected(null);
    load();
  };

  const rows = tab === "membership" ? membershipPayments : eventPayments;

  return (
    <div className="flex min-h-screen bg-stone-50">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader title="Payment History" />
        <main className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Payment History</h2>
          <p className="text-gray-500 mb-6">Verify and manage payments made through WhatsApp.</p>

          <div className="inline-flex bg-white border border-gray-100 rounded-2xl p-1.5 mb-6 shadow-sm">
            <button
              onClick={() => setTab("membership")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tab === "membership" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}
            >
              Membership Payments
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{membershipPayments.length}</span>
            </button>
            <button
              onClick={() => setTab("events")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tab === "events" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}
            >
              Event Payments
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{eventPayments.length}</span>
            </button>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-100">
                  <th className="px-6 py-4">Member</th>
                  <th className="px-6 py-4">Payment Type</th>
                  <th className="px-6 py-4">{tab === "membership" ? "Package" : "Event"}</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Status</th>
                  {tab === "membership" && <th className="px-6 py-4">Invoice Email</th>}
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-6 py-4 font-medium text-gray-900">{row.memberName}</td>
                    <td className="px-6 py-4 text-gray-600">{tab === "membership" ? "Membership" : "Event"}</td>
                    <td className="px-6 py-4 text-gray-600">{tab === "membership" ? row.packageName : row.eventTitle}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">₹{row.amount.toLocaleString("en-IN")}</td>
                    <td className="px-6 py-4 text-gray-400">{formatDate(row.date)}</td>
                    <td className="px-6 py-4 text-green-600 flex items-center gap-1.5">💬 {row.method}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[row.status]}`}>
                        {STATUS_LABEL[row.status]}
                      </span>
                    </td>
                    {tab === "membership" && (
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${INVOICE_EMAIL_STYLES[row.invoiceEmailStatus]}`}>
                          {INVOICE_EMAIL_LABEL[row.invoiceEmailStatus]}
                        </span>
                        {row.invoiceNumber && <p className="mt-1 text-xs text-gray-400">{row.invoiceNumber}</p>}
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => setSelected(row)} className="flex items-center gap-1 border border-gray-200 hover:border-green-400 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg">
                          <Eye className="h-3.5 w-3.5" /> View
                        </button>
                        {row.status === "PENDING" && (
                          <>
                            <button onClick={() => handleVerify(row)} className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg">
                              <CheckCircle className="h-3.5 w-3.5" /> Verify
                            </button>
                            <button onClick={() => handleReject(row)} className="flex items-center gap-1 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium px-3 py-1.5 rounded-lg">
                              <XCircle className="h-3.5 w-3.5" /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Payment Details</h2>
              <button onClick={() => setSelected(null)}><X className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="p-6">
              <div className="bg-green-50 rounded-xl px-4 py-3 flex items-center gap-3 mb-5">
                <span className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white text-lg">💬</span>
                <div>
                  <p className="font-semibold text-gray-900">WhatsApp Payment</p>
                  <p className="text-xs text-gray-500">Payment made through WhatsApp</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Field label="Member" value={selected.memberName} />
                <Field label="Payment Type" value={tab === "membership" ? "Membership" : "Event"} />
                <Field label={tab === "membership" ? "Package" : "Event"} value={tab === "membership" ? selected.packageName : selected.eventTitle} />
                <Field label="Amount" value={`₹${selected.amount.toLocaleString("en-IN")}`} />
                <Field label="Date" value={formatDate(selected.date)} />
                {tab === "membership" && (
                  <Field
                    label="Invoice Email"
                    value={`${INVOICE_EMAIL_LABEL[selected.invoiceEmailStatus] || "-"}${selected.invoiceNumber ? ` (${selected.invoiceNumber})` : ""}`}
                  />
                )}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Status</p>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[selected.status]}`}>{STATUS_LABEL[selected.status]}</span>
                </div>
              </div>
              {selected.status === "PENDING" && (
                <div className="flex gap-3">
                  <button onClick={() => handleReject(selected)} className="flex-1 flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 font-medium py-2.5 rounded-xl">
                    <XCircle className="h-4 w-4" /> Reject Payment
                  </button>
                  <button onClick={() => handleVerify(selected)} className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-xl">
                    <CheckCircle className="h-4 w-4" /> Verify Payment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">{label}</p>
    <p className="font-medium text-gray-900">{value}</p>
  </div>
);

export default AdminPaymentHistory;
