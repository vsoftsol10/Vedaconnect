import { AlertTriangle, X } from "lucide-react";

export default function EventDeleteModal({ event, onClose, onConfirm, isSubmitting }) {
  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="event-delete-title">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
      <div className="flex items-start justify-between gap-4"><div className="rounded-xl bg-red-50 p-2.5 text-red-600"><AlertTriangle className="h-5 w-5" /></div><button onClick={onClose} disabled={isSubmitting} className="text-gray-400 hover:text-gray-700" aria-label="Close"><X className="h-5 w-5" /></button></div>
      <h2 id="event-delete-title" className="mt-4 text-lg font-bold text-gray-900">Delete event?</h2>
      <p className="mt-2 text-sm leading-6 text-gray-500">You are deleting <span className="font-semibold text-gray-700">{event.title}</span>. This action cannot be undone.</p>
      <div className="mt-6 flex justify-end gap-3"><button onClick={onClose} disabled={isSubmitting} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button><button onClick={onConfirm} disabled={isSubmitting} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">{isSubmitting ? "Deleting..." : "Delete"}</button></div>
    </div>
  </div>;
}
