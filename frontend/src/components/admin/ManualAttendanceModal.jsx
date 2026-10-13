import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { saveManualAttendance } from "../../services/adminService";

const timeInIndia = (value) => value
  ? new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value))
  : "";

export default function ManualAttendanceModal({ isOpen, member, members, hubs, weekStart, onClose, onSaved }) {
  const [hubId, setHubId] = useState("");
  const [userId, setUserId] = useState("");
  const [status, setStatus] = useState("CONFIRMED");
  const [time, setTime] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const filteredMembers = members.filter((row) => row.hubId === hubId);

  useEffect(() => {
    setHubId(member?.hubId || "");
    setUserId(member?.userId || "");
    setStatus(member?.status === "ABSENT" ? "DECLINED" : "CONFIRMED");
    setTime(timeInIndia(member?.respondedAt));
    setError("");
  }, [isOpen, member, weekStart]);

  if (!isOpen) return null;

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      await saveManualAttendance({ userId, weekStart, status, ...(status === "CONFIRMED" ? { time } : {}) });
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not save attendance.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl sm:p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{member ? "Edit attendance" : "Add manual attendance"}</h2>
            <p className="mt-1 text-sm text-gray-500">Week of {weekStart}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-700"><X /></button>
        </div>
        {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {!member && <>
          <label className="mb-4 block text-sm font-medium text-gray-700">
            Hub
            <select required value={hubId} onChange={(event) => { setHubId(event.target.value); setUserId(""); }} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5">
              <option value="">Select a hub</option>
              {hubs.map((hub) => <option key={hub.id} value={hub.id}>{hub.name}</option>)}
            </select>
          </label>
          <label className="mb-4 block text-sm font-medium text-gray-700">
            Member
            <select required disabled={!hubId} value={userId} onChange={(event) => setUserId(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 disabled:bg-gray-50">
              <option value="">{hubId ? "Select a member" : "Select a hub first"}</option>
              {filteredMembers.map((row) => <option key={row.userId} value={row.userId}>{row.fullName}{row.businessName ? ` — ${row.businessName}` : ""}</option>)}
            </select>
          </label>
        </>}
        <label className="block text-sm font-medium text-gray-700">
          Attendance
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5">
            <option value="CONFIRMED">Present</option>
            <option value="DECLINED">Absent</option>
          </select>
        </label>
        {status === "CONFIRMED" && <label className="mt-4 block text-sm font-medium text-gray-700">
          Arrival time (IST)
          <input required type="time" value={time} onChange={(event) => setTime(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5" />
        </label>}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2.5 font-semibold text-gray-700">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-xl bg-amber-400 px-4 py-2.5 font-semibold text-gray-900 disabled:opacity-50">{saving ? "Saving…" : "Save attendance"}</button>
        </div>
      </form>
    </div>
  );
}
