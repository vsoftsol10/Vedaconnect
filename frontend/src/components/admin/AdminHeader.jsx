import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../notifications/NotificationBell";
import HeaderSearch from "../navigation/HeaderSearch";
import Dropdown from "../ui/Dropdown";

const AdminHeader = ({ title = "Dashboard" }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const handleAccountAction = (action) => {
    if (action === "profile") navigate("/admin/profile");
    if (action === "logout") {
      logout();
      navigate("/login");
    }
  };

  return (
    <header className="flex w-full min-h-[68px] items-center gap-3 border-b border-gray-100 bg-white px-4 py-3 pl-16 sm:px-6 sm:pl-16 md:px-8 md:py-5">
      <HeaderSearch role={user?.role || "ADMIN"} />

      <div className="ml-auto flex flex-shrink-0 items-center gap-2 sm:gap-6">
        <Dropdown
          value=""
          onChange={handleAccountAction}
          options={[{ value: "profile", label: "Profile" }, { value: "logout", label: "Logout" }]}
          className="w-auto"
          triggerClassName="flex min-w-0 items-center gap-2 rounded-xl px-1 py-1 text-left outline-none transition hover:bg-gray-50 focus:bg-gray-50 focus:ring-2 focus:ring-green-100 sm:gap-3"
          menuClassName="right-0 w-48"
          trigger={({ open }) => <>
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt={user.fullName || user.email} className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-700">
                {(user?.fullName || user?.email)?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <div className="hidden min-w-0 text-left sm:block">
              <p className="truncate text-sm font-semibold text-gray-900">{user?.fullName || user?.email?.split("@")[0]}</p>
              <p className="text-xs text-gray-400">Super Admin</p>
            </div>
            <ChevronDown className={`hidden h-4 w-4 text-gray-400 transition-transform sm:block ${open ? "rotate-180" : ""}`} />
          </>}
        />

        <NotificationBell badgeClass="bg-red-500 text-white" />
      </div>
    </header>
  );
};

export default AdminHeader;
