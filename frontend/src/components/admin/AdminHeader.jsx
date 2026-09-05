import { ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../notifications/NotificationBell";

const AdminHeader = ({ title = "Dashboard" }) => {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-white">
      <h1 className="text-xl font-bold text-gray-900">{title}</h1>

      <div className="flex items-center gap-6">
        <NotificationBell badgeClass="bg-red-500 text-white" />

        <div className="flex items-center gap-3">
          {user?.profilePhoto ? (
            <img src={user.profilePhoto} alt={user.fullName || user.email} className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center font-semibold text-amber-700 text-sm">
              {(user?.fullName || user?.email)?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900">{user?.fullName || user?.email?.split("@")[0]}</p>
            <p className="text-xs text-gray-400">Super Admin</p>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
