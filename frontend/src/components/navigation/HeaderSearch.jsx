import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { itemsForRole } from "../../config/navigation";

const HeaderSearch = ({ role }) => {
  const navigate = useNavigate(); const input = useRef(null); const [query, setQuery] = useState(""); const [open, setOpen] = useState(false); const [active, setActive] = useState(0);
  const results = useMemo(() => { const term = query.trim().toLowerCase(); return term ? itemsForRole(role).filter((item) => [item.label, ...item.keywords].join(" ").toLowerCase().includes(term)) : []; }, [query, role]);
  useEffect(() => { const shortcut = (event) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); input.current?.focus(); setOpen(true); } }; window.addEventListener("keydown", shortcut); return () => window.removeEventListener("keydown", shortcut); }, []);
  const choose = (item) => { navigate(item.to); setQuery(""); setOpen(false); };
  const keys = (event) => { if (event.key === "Escape") setOpen(false); if (event.key === "ArrowDown") { event.preventDefault(); setActive((value) => Math.min(value + 1, results.length - 1)); } if (event.key === "ArrowUp") { event.preventDefault(); setActive((value) => Math.max(value - 1, 0)); } if (event.key === "Enter" && results[active]) choose(results[active]); };
  return <div className="relative min-w-0 flex-1 max-w-2xl"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input ref={input} value={query} onFocus={() => setOpen(true)} onChange={(event) => { setQuery(event.target.value); setActive(0); }} onKeyDown={keys} placeholder="Search pages…" className="hidden w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-amber-400 sm:block" />{open && query && <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">{results.length ? results.map((item, index) => { const Icon = item.icon; return <button key={item.to} type="button" onMouseDown={() => choose(item)} className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm ${index === active ? "bg-amber-50" : "hover:bg-gray-50"}`}><Icon className="h-4 w-4 text-gray-500" />{item.label}</button>; }) : <p className="px-3 py-3 text-sm text-gray-500">No results found</p>}</div>}</div>;
};
export default HeaderSearch;
