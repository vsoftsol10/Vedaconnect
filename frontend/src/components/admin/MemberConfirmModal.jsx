import { AlertTriangle, X } from "lucide-react";

const MemberConfirmModal = ({ type, member, onClose, onConfirm, isSubmitting }) => {
  const deleting = type === "delete";
  const title = deleting ? `Delete ${member.fullName}?` : `Suspend ${member.fullName}?`;
  const body = deleting ? "This will permanently delete this member. This cannot be undone." : "They will lose access to community benefits. If not reactivated within 6 months, this member will be automatically and permanently deleted.";
  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="member-confirm-title">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
      <div className="flex items-start justify-between gap-4"><div className={`rounded-xl p-2.5 ${deleting ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"}`}><AlertTriangle className="h-5 w-5" /></div><button onClick={onClose} className="text-gray-400 hover:text-gray-700" aria-label="Close"><X className="h-5 w-5" /></button></div>
      <h2 id="member-confirm-title" className="mt-4 text-lg font-bold text-gray-900">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-gray-500">{body}</p>
      <div className="mt-6 flex justify-end gap-3"><button onClick={onClose} disabled={isSubmitting} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button><button onClick={onConfirm} disabled={isSubmitting} className={`rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-60 ${deleting ? "bg-red-600 text-white hover:bg-red-700" : "bg-amber-400 text-gray-900 hover:bg-amber-500"}`}>{isSubmitting ? "Working..." : deleting ? "Delete member" : "Suspend member"}</button></div>
    </div>
  </div>;
};
export default MemberConfirmModal;
