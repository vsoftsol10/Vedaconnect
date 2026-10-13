import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { saveManualWeeklyAward } from "../../services/adminService";

const emptyForm = (weekStart) => ({
  hubId: "",
  userId: "",
  weekStart,
  referralAmount: "0",
  businessAmount: "0",
});

export default function ManualWeeklyAwardModal({ isOpen, onClose, onSaved, members, hubs, weekStart }) {
  const [form, setForm] = useState(emptyForm(weekStart));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const filteredMembers = members.filter((member) => member.hubId === form.hubId);

  useEffect(() => {
    if (isOpen) {
      setForm(emptyForm(weekStart));
      setError("");
    }
  }, [isOpen, weekStart]);

  if (!isOpen) return null;

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (new Date(`${form.weekStart}T00:00:00`).getDay() !== 6) {
      setError("Please choose a Saturday week start.");
      return;
    }
    setSaving(true);
    try {
      await saveManualWeeklyAward({
        ...form,
        referralAmount: Number(form.referralAmount),
        businessAmount: Number(form.businessAmount),
      });
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not save the weekly award details.");
    } finally {
      setSaving(false);
    }
  };

  const amountField = (label, key) => (
    <label className="block text-sm font-medium text-gray-700">
      {label}
      <input
        required
        type="number"
        min="0"
        step="0.01"
        value={form[key]}
        onChange={(event) => update(key, event.target.value)}
        placeholder="Enter amount"
        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 font-normal focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
      />
    </label>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <form onSubmit={submit} className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Manual weekly award entry</h2>
            <p className="mt-1 text-sm text-gray-500">Enter the award amounts for one member and week.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"><X /></button>
        </div>
        {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Hub
            <select required value={form.hubId} onChange={(event) => setForm((current) => ({ ...current, hubId: event.target.value, userId: "" }))} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 font-normal focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100">
              <option value="">Select a hub</option>
              {hubs.map((hub) => <option key={hub.id} value={hub.id}>{hub.name}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Member
            <select required disabled={!form.hubId} value={form.userId} onChange={(event) => update("userId", event.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 font-normal disabled:bg-gray-50 disabled:text-gray-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100">
              <option value="">{form.hubId ? "Select a member" : "Select a hub first"}</option>
              {filteredMembers.map((member) => <option key={member.userId} value={member.userId}>{member.fullName || member.email}{member.businessName ? ` — ${member.businessName}` : ""}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Week starts (Saturday)
            <input required type="date" value={form.weekStart} onChange={(event) => update("weekStart", event.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 font-normal focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            {amountField("Business Giver amount (₹)", "referralAmount")}
            {amountField("Business Achiever amount (₹)", "businessAmount")}
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2.5 font-semibold text-gray-700">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-xl bg-amber-400 px-4 py-2.5 font-semibold text-gray-900 disabled:opacity-50">{saving ? "Saving…" : "Save weekly figures"}</button>
        </div>
      </form>
    </div>
  );
}
