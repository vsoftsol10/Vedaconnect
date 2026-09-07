import { useState } from "react";
import { NavLink } from "react-router-dom";
import { LayoutGrid, Users, Calendar, CircleUser, Handshake, CreditCard, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/images/vedaconnect-logo.png";

const MENU_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/members", label: "Members", icon: Users },
  { to: "/networking", label: "Networking", icon: Handshake },
  { to: "/events", label: "Events", icon: Calendar },
  { to: "/meeting-fee", label: "Meeting Fee", icon: CreditCard },
  { to: "/profile", label: "Profile", icon: CircleUser },
];

const Sidebar = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors relative ${
      isActive
        ? "bg-amber-50 text-gray-900"
        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
    }`;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed left-3 top-3 z-30 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm md:hidden"
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
      >
        <Menu className="h-5 w-5" />
      </button>

      {isOpen && <button type="button" aria-label="Close navigation menu" onClick={() => setIsOpen(false)} className="fixed inset-0 z-30 bg-black/40 md:hidden" />}

      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-100 bg-white px-4 py-6 shadow-xl transition-transform duration-200 md:sticky md:top-0 md:z-auto md:h-screen md:flex-shrink-0 md:translate-x-0 md:shadow-none ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex items-center gap-2 px-2 mb-7">
        <img src={logo} alt="VedaConnect" className="h-14 w-auto object-contain" />
        <button type="button" onClick={() => setIsOpen(false)} className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-50 md:hidden" aria-label="Close navigation menu">
          <X className="h-5 w-5" />
        </button>
      </div>

      <p className="px-4 text-[11px] font-semibold tracking-widest text-gray-400 uppercase mb-2">Menu</p>
      <nav className="space-y-1 mb-8">
        {MENU_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={linkClasses} onClick={() => setIsOpen(false)}>
            {({ isActive }) => (
              <>
                <Icon className="h-4.5 w-4.5" />
                {label}
                {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-6 flex items-center gap-3 px-2 border-t border-gray-100">
        <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center font-semibold text-amber-700 text-sm">
          {user?.email?.[0]?.toUpperCase() || "?"}
        </div>
        <div className="text-sm">
          <p className="font-semibold text-gray-900 truncate max-w-[140px]">{user?.email}</p>
        </div>
      </div>
      </aside>
    </>
  );
};

export default Sidebar;
