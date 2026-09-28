import { useEffect, useRef, useState } from "react";
import { Eye, MoreVertical, Pencil, Trash2 } from "lucide-react";

export default function EventActionMenu({ event, onView, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const closeOnOutsideClick = (e) => !menuRef.current?.contains(e.target) && !buttonRef.current?.contains(e.target) && setOpen(false);
    const closeOnEscape = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => { document.removeEventListener("mousedown", closeOnOutsideClick); document.removeEventListener("keydown", closeOnEscape); };
  }, []);

  const toggle = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const opensUp = window.innerHeight - rect.bottom < 150;
      setMenuStyle({ position: "fixed", right: Math.max(12, window.innerWidth - rect.right), top: opensUp ? "auto" : rect.bottom + 8, bottom: opensUp ? window.innerHeight - rect.top + 8 : "auto" });
    }
    setOpen((value) => !value);
  };
  const choose = (action) => () => { setOpen(false); action(); };
  return <div className="relative flex justify-end">
    <button ref={buttonRef} onClick={toggle} aria-label={`Actions for ${event.title}`} aria-expanded={open} className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-amber-50 hover:text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-300">
      <MoreVertical className="h-5 w-5" />
    </button>
    {open && <div ref={menuRef} style={menuStyle} className="z-50 w-36 rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg shadow-gray-200/70">
      <button onClick={choose(onView)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 transition hover:bg-amber-50 hover:text-amber-800"><Eye className="h-4 w-4" /> View</button>
      <button onClick={choose(onEdit)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 transition hover:bg-amber-50 hover:text-amber-800"><Pencil className="h-4 w-4" /> Edit</button>
      <div className="my-1 border-t border-gray-100" />
      <button onClick={choose(onDelete)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"><Trash2 className="h-4 w-4" /> Delete</button>
    </div>}
  </div>;
}
