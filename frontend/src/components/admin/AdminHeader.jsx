import { ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../notifications/NotificationBell";

const AdminHeader = ({ title = "Dashboard" }) => {
  const { user } = useAuth();

  return (
    <header className="flex min-h-[68px] items-center justify-between gap-3 border-b border-gray-100 bg-white px-4 py-3 pl-16 sm:px-6 sm:pl-16 md:px-8 md:py-5">
      <h1 className="truncate text-lg font-bold text-gray-900 sm:text-xl">{title}</h1>

      <div className="flex flex-shrink-0 items-center gap-2 sm:gap-6">
        <NotificationBell badgeClass="bg-red-500 text-white" />

        <div className="flex items-center gap-2 sm:gap-3">
          {user?.profilePhoto ? (
            <img src={user.profilePhoto} alt={user.fullName || user.email} className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center font-semibold text-amber-700 text-sm">
              {(user?.fullName || user?.email)?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <div className="hidden min-w-0 text-left sm:block">
            <p className="truncate text-sm font-semibold text-gray-900">{user?.fullName || user?.email?.split("@")[0]}</p>
            <p className="text-xs text-gray-400">Super Admin</p>
          </div>
          <ChevronDown className="hidden h-4 w-4 text-gray-400 sm:block" />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
