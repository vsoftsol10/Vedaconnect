import { useEffect, useRef, useState } from "react";
import { Ban, Eye, MoreVertical, Pencil, Play, Trash2 } from "lucide-react";

const MemberActionMenu = ({ member, onView, onEdit, onSuspend, onReactivate, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target) && !buttonRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const toggle = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuHeight = 190;
      const opensUp = window.innerHeight - rect.bottom < menuHeight;
      setMenuStyle({ position: "fixed", right: Math.max(12, window.innerWidth - rect.right), top: opensUp ? "auto" : rect.bottom + 8, bottom: opensUp ? window.innerHeight - rect.top + 8 : "auto" });
    }
    setOpen((value) => !value);
  };
  const choose = (action) => () => { setOpen(false); action(); };
  const suspended = member.membershipStatus === "SUSPENDED";

  return <div className="flex justify-end">
    <button ref={buttonRef} onClick={toggle} aria-label={`Actions for ${member.fullName}`} aria-expanded={open} className="rounded-lg p-2 text-gray-500 transition hover:bg-amber-50 hover:text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-300">
      <MoreVertical className="h-5 w-5" />
    </button>
    {open && <div ref={menuRef} style={menuStyle} className="z-50 w-44 rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg shadow-gray-200/70">
      <MenuItem icon={Eye} label="View Details" onClick={choose(onView)} />
      <MenuItem icon={Pencil} label="Edit" onClick={choose(onEdit)} />
      <MenuItem icon={suspended ? Play : Ban} label={suspended ? "Reactivate" : "Suspend"} onClick={choose(suspended ? onReactivate : onSuspend)} />
      <div className="my-1 border-t border-gray-100" />
      <MenuItem icon={Trash2} label="Delete" destructive onClick={choose(onDelete)} />
    </div>}
  </div>;
};

const MenuItem = ({ icon: Icon, label, destructive = false, onClick }) => <button onClick={onClick} className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${destructive ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-amber-50 hover:text-amber-800"}`}>
  <Icon className="h-4 w-4" /> {label}
</button>;

export default MemberActionMenu;
