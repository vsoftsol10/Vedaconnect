const money = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(amount || 0));

// Compatibility renderer for the existing admin expense page. It deliberately
// renders only category totals, never a nested FinanceHistoryTable.
const CategoryBreakdownDrilldown = ({ breakdown = {}, monthExpenses = [] }) => {
  const rows = Object.entries(breakdown).map(([category, total]) => ({ category, total: Number(total || 0), entries: monthExpenses.filter((expense) => String(expense.category).trim().toLowerCase() === String(category).trim().toLowerCase()).length })).sort((a, b) => b.total - a.total);
  return <div className="overflow-x-auto"><table className="min-w-[420px] w-full text-sm"><thead><tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-400"><th className="p-2">Category</th><th className="p-2 text-right">Entries</th><th className="p-2 text-right">Total</th></tr></thead><tbody>{rows.map((row) => <tr key={row.category} className="border-b border-gray-100 last:border-0"><td className="p-2 text-gray-700">{row.category}</td><td className="p-2 text-right">{row.entries}</td><td className="p-2 text-right font-semibold">{money(row.total)}</td></tr>)}{!rows.length && <tr><td colSpan={3} className="p-4 text-center text-gray-500">No expense categories for this period.</td></tr>}</tbody></table></div>;
};

export default CategoryBreakdownDrilldown;
