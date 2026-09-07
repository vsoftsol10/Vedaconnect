import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutGrid, Users, Building2, Calendar, CreditCard, Receipt, CircleUser, LogOut, Trophy, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/images/vedaconnect-logo.png";

const MENU_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/admin/members", label: "Members", icon: Users },
  { to: "/admin/hubs", label: "Hubs", icon: Building2 },
  { to: "/admin/events", label: "Events", icon: Calendar },
  { to: "/admin/leaderboard", label: "Awards", icon: Trophy },
  { to: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { to: "/admin/payment-history", label: "Payment History", icon: Receipt },
  { to: "/admin/profile", label: "Profile", icon: CircleUser },
];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive ? "bg-amber-50 text-gray-900" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
    }`;

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className="fixed left-3 top-3 z-30 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm md:hidden" aria-label="Open admin navigation" aria-expanded={isOpen}>
        <Menu className="h-5 w-5" />
      </button>
      {isOpen && <button type="button" onClick={() => setIsOpen(false)} className="fixed inset-0 z-30 bg-black/40 md:hidden" aria-label="Close admin navigation" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-100 bg-white px-4 py-6 shadow-xl transition-transform duration-200 md:sticky md:top-0 md:z-auto md:h-screen md:flex-shrink-0 md:translate-x-0 md:shadow-none ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex items-center gap-2 px-2 mb-8">
        <img src={logo} alt="VedaConnect" className="h-14 w-auto object-contain" />
        <button type="button" onClick={() => setIsOpen(false)} className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-50 md:hidden" aria-label="Close admin navigation"><X className="h-5 w-5" /></button>
      </div>

      <nav className="space-y-1 flex-1">
        {MENU_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={linkClasses} onClick={() => setIsOpen(false)}>
            <Icon className="h-4.5 w-4.5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="pt-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors mb-3"
        >
          <LogOut className="h-4.5 w-4.5" /> Logout
        </button>
        <div className="flex items-center gap-3 px-2">
          {user?.profilePhoto ? (
            <img src={user.profilePhoto} alt={user.fullName || user.email} className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center font-semibold text-amber-700 text-sm">
              {(user?.fullName || user?.email)?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <div className="text-sm min-w-0">
            <p className="font-semibold text-gray-900 truncate">{user?.fullName || user?.email}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            <p className="text-xs text-gray-400">Super Admin</p>
          </div>
        </div>
      </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
