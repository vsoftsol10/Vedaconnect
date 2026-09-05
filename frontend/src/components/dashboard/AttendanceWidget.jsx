import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import {
  confirmAttendance,
  declineAttendance,
  getMyAttendanceStatus,
} from "../../services/attendanceService";

const AttendanceWidget = () => {
  const [attendance, setAttendance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setIsLoading(true);
    setAttendance(await getMyAttendanceStatus());
    setIsLoading(false);
  };

  useEffect(() => {
    load().catch((err) => {
      setError(err.message);
      setIsLoading(false);
    });
  }, []);

  const respond = async (action) => {
    setIsSaving(true);
    setError("");
    try {
      const result = action === "confirm" ? await confirmAttendance() : await declineAttendance();
      setAttendance(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const status = attendance?.status || "PENDING";

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Weekly Meeting Attendance</h2>
          <p className="text-sm text-gray-500 mt-1">
            {attendance?.weekStart
              ? `Week of ${new Date(attendance.weekStart).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}`
              : "Current week"}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading
          </div>
        ) : status === "PENDING" ? (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => respond("confirm")}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Confirm
            </button>
            <button
              type="button"
              onClick={() => respond("decline")}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-red-200 hover:text-red-600 disabled:opacity-60"
            >
              <XCircle className="h-4 w-4" />
              Decline
            </button>
          </div>
        ) : (
          <span
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${
              status === "CONFIRMED" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
            }`}
          >
            {status === "CONFIRMED" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {status === "CONFIRMED" ? "Confirmed" : "Declined"}
          </span>
        )}
      </div>
      {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
    </div>
  );
};

export default AttendanceWidget;
