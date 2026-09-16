import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const Dropdown = ({ value, onChange, options, placeholder = "Select", className = "", trigger, triggerClassName = "", menuClassName = "" }) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef(null);
  const selected = options.find((option) => option.value === value);
  useEffect(() => { const close = (event) => { if (!root.current?.contains(event.target)) setOpen(false); }; document.addEventListener("mousedown", close); return () => document.removeEventListener("mousedown", close); }, []);
  const choose = (option) => { onChange(option.value); setOpen(false); };
  const openMenu = () => { setActive(Math.max(0, options.findIndex((option) => option.value === value))); setOpen(true); };
  const keyDown = (event) => { if (!open && ["Enter", " ", "ArrowDown"].includes(event.key)) { event.preventDefault(); openMenu(); return; } if (!open) return; if (event.key === "Escape") { event.preventDefault(); setOpen(false); event.currentTarget.focus(); } if (event.key === "ArrowDown") { event.preventDefault(); setActive((current) => Math.min(current + 1, options.length - 1)); } if (event.key === "ArrowUp") { event.preventDefault(); setActive((current) => Math.max(current - 1, 0)); } if (event.key === "Enter") { event.preventDefault(); choose(options[active]); } };
  return <div ref={root} className={`relative ${className}`}><button type="button" onClick={() => open ? setOpen(false) : openMenu()} onKeyDown={keyDown} aria-haspopup="listbox" aria-expanded={open} className={trigger ? triggerClassName : `vc-dropdown-trigger ${triggerClassName}`}>{trigger ? trigger({ open }) : <>{selected?.label || placeholder}<ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} /></>}</button>{open && <div role="listbox" className={`vc-dropdown-menu ${menuClassName}`}>{options.map((option, index) => <button key={option.value} type="button" role="option" aria-selected={option.value === value} onMouseEnter={() => setActive(index)} onClick={() => choose(option)} className={`vc-dropdown-option ${option.value === value || active === index ? "bg-amber-50 text-gray-900" : ""}`}>{option.label}{option.value === value && <Check className="h-4 w-4 text-green-600" />}</button>)}</div>}</div>;
};

export default Dropdown;
