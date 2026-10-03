import { useState } from "react";
import { Send, X } from "lucide-react";
import { previewExpenseSummaryPdf, sendExpenseSummary, sendExpenseSummaryPdf } from "../../services/expenseService";

const MAX_PDF_BYTES = 5 * 1024 * 1024;
const monthLabelFor = (month, year) => new Date(year, month - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

const summaryErrorMessage = (error, hubName, month, year) => {
  const status = error?.response?.status;
  const message = error?.response?.data?.message || error?.message;
  if (status === 409) return `Summary already sent for ${hubName || "this hub"}, ${monthLabelFor(month, year)}.`;
  if (status === 500 && /template/i.test(message || "")) return "The PDF month-end WhatsApp template is not configured.";
  return message || "Could not complete the month-end summary request.";
};

const PdfSummarySender = ({ hubId, hubName, month, year, onSent }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [inputKey, setInputKey] = useState(0);

  const clearFile = () => { setFile(null); setInputKey((key) => key + 1); };
  const choosePdf = (event) => {
    const selected = event.target.files?.[0] || null;
    setError("");
    if (!selected) return clearFile();
    if (!/\.pdf$/i.test(selected.name) || (selected.type && selected.type !== "application/pdf")) { clearFile(); setError("Choose a PDF file."); return; }
    if (selected.size > MAX_PDF_BYTES) { clearFile(); setError("Accounts PDF must be 5 MB or smaller."); return; }
    setFile(selected);
  };

  const openConfirmation = async () => {
    if (!hubId || !month || busy) return;
    setBusy(true); setError(""); setNotice("");
    try {
      // The existing preview supplies the same hub recipients for either delivery template.
      setPreview(await previewExpenseSummaryPdf({ hubId, month, year }));
    } catch (requestError) { setError(summaryErrorMessage(requestError, hubName, month, year)); } finally { setBusy(false); }
  };

  const confirmSend = async () => {
    if (!preview || busy) return;
    setBusy(true); setError("");
    try {
      const result = file ? await sendExpenseSummaryPdf({ hubId, month, year }, file) : await sendExpenseSummary({ hubId, month, year });
      const remaining = result.remainingRecipients?.map((recipient) => `${recipient.name} (${recipient.phone})`).join(", ");
      setNotice(result.stopped ? `Sent to ${result.successCount} member(s) before an error. Still needs delivery: ${remaining || "the failed recipient"}.` : `Summary sent: ${result.successCount} successful, ${result.failureCount || 0} failed.`);
      setPreview(null);
      if (file) clearFile();
      await onSent?.();
    } catch (requestError) { setError(summaryErrorMessage(requestError, preview.hubName || hubName, month, year)); } finally { setBusy(false); }
  };

  const disabledReason = !hubId ? "Select a hub to send the summary." : !month ? "Select a month to send the summary." : busy ? "The summary is being sent." : "";
  return <div className="w-full sm:w-auto"><div className="flex flex-col gap-2 sm:flex-row sm:items-center"><label className="text-sm font-medium text-gray-700">Attachment <span className="font-normal text-gray-500">(optional)</span>{file ? <span className="mt-1 flex min-h-11 items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 font-normal text-gray-700"><span className="min-w-0 flex-1 truncate" title={file.name}>{file.name}</span><button type="button" onClick={clearFile} disabled={busy} aria-label={`Remove ${file.name}`} className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed"><X className="h-4 w-4" /></button></span> : <span className="mt-1 block min-h-11 cursor-pointer rounded-xl border border-gray-300 bg-white px-3 py-2 font-normal text-gray-700">Choose accounts PDF<input key={inputKey} type="file" accept=".pdf,application/pdf" disabled={busy} onChange={choosePdf} className="sr-only" /></span>}</label><div className="sm:self-end"><button type="button" onClick={openConfirmation} disabled={Boolean(disabledReason)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"><Send className="h-4 w-4" />{busy ? "Working…" : "Send Month-End Summary"}</button>{disabledReason && <p className="mt-1 max-w-60 text-xs text-gray-500">{disabledReason}</p>}</div></div>{error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}{notice && <p className="mt-2 text-sm text-green-700">{notice}</p>}{preview && <div role="dialog" aria-modal="true" aria-label="Confirm month-end summary" className="fixed inset-0 z-[80] flex items-end bg-black/40 p-3 sm:items-center sm:p-6"><div className="max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-4 shadow-xl sm:mx-auto sm:max-w-lg sm:p-6"><h2 className="text-lg font-bold text-gray-900">Confirm month-end summary</h2><dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2"><SummaryValue label="Hub" value={preview.hubName} /><SummaryValue label="Month" value={preview.monthLabel} />{file && <SummaryValue className="sm:col-span-2" label="PDF" value={file.name} breakWords />}<SummaryValue label="Income" value={preview.messageValues.income} /><SummaryValue label="Expenses" value={preview.messageValues.expenses} /><SummaryValue label="Balance" value={preview.messageValues.balance} /><SummaryValue label="Message month" value={preview.messageValues.month} /></dl>{file && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Check these figures match the PDF.</p>}<h3 className="mt-4 font-semibold text-gray-900">Recipients ({preview.recipientCount})</h3><ul className="mt-2 max-h-48 divide-y overflow-y-auto rounded-xl border border-gray-200 text-sm">{preview.recipients.map((recipient) => <li key={`${recipient.name}-${recipient.phone}`} className="flex flex-wrap justify-between gap-x-3 p-3"><span>{recipient.name}</span><span className="text-gray-500">{recipient.phone}</span></li>)}</ul><div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" disabled={busy} onClick={() => setPreview(null)} className="min-h-11 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold disabled:opacity-60">Cancel</button><button type="button" disabled={busy} onClick={confirmSend} className="min-h-11 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{busy ? "Sending…" : "Confirm and send"}</button></div></div></div>}</div>;
};

const SummaryValue = ({ className = "", label, value, breakWords = false }) => <div className={className}><dt className="text-gray-500">{label}</dt><dd className={`${breakWords ? "break-all " : ""}font-semibold`}>{value}</dd></div>;

export default PdfSummarySender;
