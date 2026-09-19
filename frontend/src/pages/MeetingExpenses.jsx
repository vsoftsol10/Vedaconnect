import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import MonthlySummary from "../components/expenses/MonthlySummary";
import { getExpenseSummary } from "../services/expenseService";

const now = new Date();
const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

const MeetingExpenses = () => {
  const [searchParams] = useSearchParams();
  const requestedMonth = searchParams.get("month");
  const requestedYear = searchParams.get("year");
  const [month, setMonth] = useState(requestedMonth && requestedYear ? `${requestedYear}-${String(requestedMonth).padStart(2, "0")}` : currentMonth); const [summary, setSummary] = useState(null); const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  useEffect(() => { const [year, monthNumber] = month.split("-").map(Number); setLoading(true); getExpenseSummary({ month: monthNumber, year }).then(setSummary).catch((err) => setError(err.message || "Could not load the summary.")).finally(() => setLoading(false)); }, [month]);
  return <div className="flex min-h-screen bg-stone-50"><Sidebar /><div className="min-w-0 flex-1"><DashboardHeader /><main className="px-4 py-6 sm:px-6 md:p-8"><h1 className="text-2xl font-bold text-gray-900">Meeting Expenses</h1><p className="mb-6 text-gray-500">A transparent monthly summary for your hub. Individual expenses and receipts are kept private.</p><div className="mb-6 max-w-xs"><label className="text-sm font-medium text-gray-700">Month<input type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="vc-select mt-1.5 min-h-11 w-full rounded-xl px-4 py-2.5" /></label></div>{error ? <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : <div className="max-w-3xl"><MonthlySummary summary={summary} loading={loading} /></div>}</main></div></div>;
};
export default MeetingExpenses;
