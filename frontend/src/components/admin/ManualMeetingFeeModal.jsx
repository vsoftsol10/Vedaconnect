import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { createManualFeeCollection } from "../../services/expenseService";
import { listAdminMembers } from "../../services/adminService";

const firstSaturdayOfMonth = (month) => {
  const date = new Date(`${month}-01T12:00:00`);
  date.setDate(1 + ((6 - date.getDay() + 7) % 7));
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
const lastDayOfMonth = (month) => new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0).getDate();

const initialForm = (month) => ({
  hubId: "",
  memberId: "",
  date: `${month}-01`,
  meetingWeek: firstSaturdayOfMonth(month),
  amount: "1800",
  paymentMode: "CASH",
  note: "",
});

export default function ManualMeetingFeeModal({ isOpen, month, hubs, onClose, onSaved }) {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(initialForm(month));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const filteredMembers = members;

  useEffect(() => {
    if (isOpen) {
      setForm(initialForm(month));
      setError("");
      setMembers([]);
    }
  }, [isOpen, month]);

  useEffect(() => {
    if (!isOpen || !form.hubId) return undefined;
    let active = true;
    listAdminMembers({ hubId: form.hubId })
      .then((rows) => { if (active) setMembers(rows); })
      .catch((err) => { if (active) setError(err.message || "Could not load members for this hub."); });
    return () => { active = false; };
  }, [isOpen, form.hubId]);

  if (!isOpen) return null;

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.date.startsWith(`${month}-`)) {
      setError(`Payment date must be within ${month}.`);
      return;
    }
    setSaving(true);
    try {
      await createManualFeeCollection({ ...form, amount: Number(form.amount) });
      onSaved();
    } catch (err) {
      setError(err.message || "Could not record the manual meeting fee.");
    } finally {
      setSaving(false);
    }
  };

  const fieldClass = "mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 font-normal focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <form onSubmit={submit} className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Record manual meeting fee</h2>
            <p className="mt-1 text-sm text-gray-500">The payment will appear as paid in the member portal.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"><X /></button>
        </div>
        {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Hub
            <select required value={form.hubId} onChange={(event) => setForm((current) => ({ ...current, hubId: event.target.value, memberId: "" }))} className={fieldClass}>
              <option value="">Select a hub</option>
              {hubs.map((hub) => <option key={hub.id} value={hub.id}>{hub.name}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Member
            <select required disabled={!form.hubId} value={form.memberId} onChange={(event) => update("memberId", event.target.value)} className={`${fieldClass} disabled:bg-gray-50 disabled:text-gray-400`}>
              <option value="">{form.hubId ? "Select a member" : "Select a hub first"}</option>
              {filteredMembers.map((member) => <option key={member.userId} value={member.userId}>{member.fullName}{member.businessName ? ` — ${member.businessName}` : ""}</option>)}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700">
              Payment date
              <input required type="date" min={`${month}-01`} max={`${month}-${String(lastDayOfMonth(month)).padStart(2, "0")}`} value={form.date} onChange={(event) => update("date", event.target.value)} className={fieldClass} />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Meeting week
              <input required type="date" value={form.meetingWeek} onChange={(event) => update("meetingWeek", event.target.value)} className={fieldClass} />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700">
              Amount (₹)
              <input required type="number" min="0.01" step="0.01" value={form.amount} onChange={(event) => update("amount", event.target.value)} className={fieldClass} />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Payment method
              <select value={form.paymentMode} onChange={(event) => update("paymentMode", event.target.value)} className={fieldClass}>
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="BANK_TRANSFER">Bank transfer</option>
              </select>
            </label>
          </div>
          <label className="block text-sm font-medium text-gray-700">
            Note (optional)
            <input maxLength={200} value={form.note} onChange={(event) => update("note", event.target.value)} className={fieldClass} />
          </label>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2.5 font-semibold text-gray-700">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-xl bg-amber-400 px-4 py-2.5 font-semibold text-gray-900 disabled:opacity-50">{saving ? "Saving…" : "Record payment"}</button>
        </div>
      </form>
    </div>
  );
}
