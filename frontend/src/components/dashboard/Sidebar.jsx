import { NavLink, useNavigate } from "react-router-dom";
import { LayoutGrid, Users, Calendar, CircleUser, CircleHelp, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/images/vedaconnect-logo.png";

const MENU_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/members", label: "Members", icon: Users },
  { to: "/events", label: "Events", icon: Calendar },
  { to: "/profile", label: "Profile", icon: CircleUser },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors relative ${
      isActive
        ? "bg-amber-50 text-gray-900"
        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
    }`;

  return (
    <aside className="w-64 flex-shrink-0 h-screen sticky top-0 border-r border-gray-100 bg-white flex flex-col px-4 py-6">
      <div className="flex items-center gap-2 px-2 mb-8">
        <img src={logo} alt="VedaConnect" className="h-10 w-auto object-contain" />
      </div>

      <p className="px-4 text-[11px] font-semibold tracking-widest text-gray-400 uppercase mb-2">Menu</p>
      <nav className="space-y-1 mb-8">
        {MENU_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={linkClasses}>
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

      <p className="px-4 text-[11px] font-semibold tracking-widest text-gray-400 uppercase mb-2">Support</p>
      <nav className="space-y-1">
        <NavLink to="/help" className={linkClasses}>
          <CircleHelp className="h-4.5 w-4.5" />
          Help & Support
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-4.5 w-4.5" />
          Logout
        </button>
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
  );
};

export default Sidebar;
