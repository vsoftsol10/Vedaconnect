import { useState } from "react";
import { ChevronDown, Receipt } from "lucide-react";

const money = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(amount || 0));
const categoryKey = (category) => String(category || "").toLocaleLowerCase();

const CategoryBreakdownDrilldown = ({ breakdown, monthExpenses, allExpenses, loadingAllExpenses, onLoadAllExpenses }) => {
  const [expandedCategory, setExpandedCategory] = useState("");
  const [period, setPeriod] = useState("month");
  const categories = Object.entries(breakdown || {});
  const sourceExpenses = period === "all" ? (allExpenses || []) : monthExpenses;
  const selectPeriod = async (nextPeriod) => {
    setPeriod(nextPeriod);
    if (nextPeriod === "all" && !allExpenses && !loadingAllExpenses) await onLoadAllExpenses();
  };

  if (!categories.length) return <p className="text-sm text-gray-500">No expenses recorded for this month.</p>;

  return <div>
    <div className="mb-3 inline-flex rounded-lg bg-gray-100 p-1" role="group" aria-label="Expense period">
      <button type="button" onClick={() => selectPeriod("month")} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${period === "month" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>Selected month</button>
      <button type="button" onClick={() => selectPeriod("all")} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${period === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>All months</button>
    </div>
    <div className="space-y-2">
      {categories.map(([category, categoryAmount]) => {
        const expanded = expandedCategory === category;
        const matchingExpenses = sourceExpenses.filter((expense) => categoryKey(expense.category) === categoryKey(category));
        const subtotal = period === "month" ? categoryAmount : matchingExpenses.reduce((total, expense) => total + Number(expense.amount || 0), 0);
        return <div key={category} className="rounded-xl bg-gray-50">
          <button type="button" onClick={() => setExpandedCategory(expanded ? "" : category)} aria-expanded={expanded} className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2">
            <span className="flex min-w-0 items-center gap-2"><ChevronDown className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden="true" /><span className="truncate text-gray-700">{category}</span></span>
            <strong className="shrink-0 text-gray-900">{money(categoryAmount)}</strong>
          </button>
          {expanded && <div className="border-t border-gray-200 px-3 py-3">
            {period === "all" && loadingAllExpenses ? <p className="text-sm text-gray-500">Loading all expense history...</p> : <><div className="overflow-x-auto"><table className="min-w-[700px] w-full text-sm"><thead><tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-400"><th className="p-2">Date</th><th className="p-2">Description</th><th className="p-2 text-right">Amount</th><th className="p-2 text-center">Receipt</th><th className="p-2">Recorded by</th></tr></thead><tbody>{matchingExpenses.map((expense) => <tr key={expense.id} className="border-b border-gray-200/70 last:border-0"><td className="whitespace-nowrap p-2">{new Date(expense.date).toLocaleDateString("en-IN")}</td><td className="p-2">{expense.description}</td><td className="whitespace-nowrap p-2 text-right font-medium">{money(expense.amount)}</td><td className="p-2 text-center">{expense.receiptUrl ? <a href={expense.receiptUrl} target="_blank" rel="noreferrer" className="inline-flex text-green-700 underline" aria-label={`Open receipt for ${expense.description}`}><Receipt className="h-4 w-4" /></a> : "—"}</td><td className="p-2">{expense.creator?.fullName || expense.creator?.email || "—"}</td></tr>)}{!matchingExpenses.length && <tr><td colSpan={5} className="p-4 text-center text-gray-500">No matching expenses.</td></tr>}</tbody></table></div><div className="mt-3 flex justify-end border-t border-gray-200 pt-3 text-sm"><span className="text-gray-500">{period === "month" ? "Selected month subtotal" : "All months subtotal"}</span><strong className="ml-3 text-gray-900">{money(subtotal)}</strong></div></>}
          </div>}
        </div>;
      })}
    </div>
  </div>;
};

export default CategoryBreakdownDrilldown;
