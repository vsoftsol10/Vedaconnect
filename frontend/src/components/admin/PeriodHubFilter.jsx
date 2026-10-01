import { ChevronLeft, ChevronRight } from "lucide-react";
import Dropdown from "../ui/Dropdown";
import { formatPeriodRange } from "../../hooks/usePeriodRange";

const PeriodHubFilter = ({ periodState, hub, onHubChange, hubs = [], sort, onSortChange }) => {
  const { period, range, setPeriod, previous, next, canGoNext } = periodState;
  return <div className="flex flex-wrap items-center gap-2">
    <div className="flex w-full rounded-xl border border-gray-100 bg-white p-1 sm:w-auto">
      {["week", "month", "year"].map((key) => <button key={key} type="button" onClick={() => setPeriod(key)} className={`min-h-11 flex-1 rounded-lg px-3 py-2 text-sm font-semibold capitalize sm:flex-none sm:px-4 ${period === key ? "bg-amber-400 text-gray-900" : "text-gray-500 hover:text-gray-900"}`}>{key}</button>)}
    </div>
    <div className="flex w-full items-center justify-between rounded-xl border border-gray-100 bg-white p-1 sm:w-auto">
      <button type="button" onClick={previous} className="p-2 text-gray-500 hover:text-gray-900" aria-label="Previous period"><ChevronLeft className="h-4 w-4" /></button>
      <span className="min-w-36 px-2 text-center text-sm font-semibold text-gray-700">{formatPeriodRange(range)}</span>
      <button type="button" onClick={next} disabled={!canGoNext} className="p-2 text-gray-500 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-30" aria-label="Next period"><ChevronRight className="h-4 w-4" /></button>
    </div>
    <Dropdown value={hub} onChange={onHubChange} className="w-full sm:w-48" options={[{ value: "all", label: "All Hubs" }, ...hubs.map((row) => ({ value: row.id, label: row.name }))]} />
    {onSortChange && <div className="flex rounded-xl border border-gray-100 bg-white p-1">{[["business", "Business"], ["referrals", "Referrals"]].map(([key, label]) => <button key={key} type="button" onClick={() => onSortChange(key)} className={`rounded-lg px-4 py-2 text-sm font-semibold ${sort === key ? "bg-green-600 text-white" : "text-gray-500 hover:text-gray-900"}`}>{label}</button>)}</div>}
  </div>;
};

export default PeriodHubFilter;
