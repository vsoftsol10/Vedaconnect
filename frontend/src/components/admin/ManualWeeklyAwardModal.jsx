import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getManualWeeklyAwardActivity, saveManualWeeklyAward, updateManualWeeklyAward } from "../../services/adminService";

const emptyForm = (weekStart, entry) => ({
  hubId: entry?.hubId || "",
  userId: entry?.userId || "",
  weekStart: entry?.weekStart ? new Date(entry.weekStart).toISOString().slice(0, 10) : weekStart,
  referralAmount: String(entry?.referralAmount ?? 0),
  businessAmount: String(entry?.businessAmount ?? 0),
});

const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
}).format(Number(amount || 0));

export default function ManualWeeklyAwardModal({ isOpen, onClose, onSaved, members, hubs, weekStart, entry = null }) {
  const [form, setForm] = useState(emptyForm(weekStart));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [activity, setActivity] = useState(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState("");
  const [activityRetry, setActivityRetry] = useState(0);
  const [acknowledged, setAcknowledged] = useState(false);
  const filteredMembers = members.filter((member) => member.hubId === form.hubId);

  useEffect(() => {
    if (isOpen) {
      setForm(emptyForm(weekStart, entry));
      setError("");
      setActivity(null);
      setActivityError("");
      setAcknowledged(false);
    }
  }, [isOpen, weekStart, entry]);

  useEffect(() => {
    let current = true;
    setActivity(null);
    setActivityError("");
    setAcknowledged(false);
    if (!isOpen || !form.userId || !form.weekStart) {
      setActivityLoading(false);
      return () => { current = false; };
    }
    const selectedWeek = new Date(`${form.weekStart}T00:00:00.000Z`);
    if (Number.isNaN(selectedWeek.getTime()) || selectedWeek.getUTCDay() !== 6) {
      setActivityLoading(false);
      return () => { current = false; };
    }
    setActivityLoading(true);
    getManualWeeklyAwardActivity({ userId: form.userId, weekStart: form.weekStart })
      .then((result) => { if (current) setActivity(result); })
      .catch((err) => { if (current) setActivityError(err?.response?.data?.message || err.message || "Could not check member-entered award activity."); })
      .finally(() => { if (current) setActivityLoading(false); });
    return () => { current = false; };
  }, [isOpen, form.userId, form.weekStart, activityRetry]);

  if (!isOpen) return null;

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const hasMemberActivity = (activity?.referrals.count || 0) > 0 || (activity?.business.count || 0) > 0;
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (new Date(`${form.weekStart}T00:00:00`).getDay() !== 6) {
      setError("Please choose a Saturday week start.");
      return;
    }
    if (activityLoading || activityError || !activity) {
      setError("Wait for the member-entered activity check to complete before saving.");
      return;
    }
    if (hasMemberActivity && !acknowledged) {
      setError("Please acknowledge the member-entered activity warning before saving.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        referralAmount: Number(form.referralAmount),
        businessAmount: Number(form.businessAmount),
      };
      if (entry) await updateManualWeeklyAward(entry.id, payload);
      else await saveManualWeeklyAward(payload);
      onSaved(payload);
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
            <h2 className="text-lg font-bold text-gray-900">{entry ? "Edit manual award entry" : "Manual weekly award entry"}</h2>
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
          {form.userId && form.weekStart && (
            activityLoading ? (
              <p className="rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-600">Checking member-entered activity…</p>
            ) : activityError ? (
              <div role="alert" className="rounded-xl bg-red-50 px-3 py-3 text-sm text-red-700">
                <p>{activityError}</p>
                <button type="button" onClick={() => setActivityRetry((value) => value + 1)} className="mt-2 font-semibold underline">Retry check</button>
              </div>
            ) : activity && hasMemberActivity ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">
                <p className="font-semibold">This member has already logged activity for this week.</p>
                <p className="mt-1">
                  {activity.referrals.count > 0 && `${activity.referrals.count} referral(s), ${formatCurrency(activity.referrals.amount)}`}
                  {activity.referrals.count > 0 && activity.business.count > 0 && " · "}
                  {activity.business.count > 0 && `${activity.business.count} business transaction(s), ${formatCurrency(activity.business.amount)}`}
                </p>
                <p className="mt-1">Saving these manual amounts will replace the member-entered totals in the leaderboard for this week.</p>
                <label className="mt-3 flex items-start gap-2 font-medium">
                  <input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} className="mt-1 accent-amber-500" />
                  <span>I understand and want to continue with the manual amounts.</span>
                </label>
              </div>
            ) : activity ? (
              <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">No member-entered referral or business activity was found for this week.</p>
            ) : null
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {amountField("Business Giver amount (₹)", "referralAmount")}
            {amountField("Business Achiever amount (₹)", "businessAmount")}
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2.5 font-semibold text-gray-700">Cancel</button>
          <button type="submit" disabled={saving || activityLoading || Boolean(activityError) || (hasMemberActivity && !acknowledged)} className="rounded-xl bg-amber-400 px-4 py-2.5 font-semibold text-gray-900 disabled:opacity-50">{saving ? "Saving…" : entry ? "Save changes" : "Save weekly figures"}</button>
        </div>
      </form>
    </div>
  );
}
