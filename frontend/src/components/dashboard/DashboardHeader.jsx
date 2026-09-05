import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, User, Calendar, LogOut } from "lucide-react";
import { getMyProfile } from "../../services/memberService";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../notifications/NotificationBell";

const DashboardHeader = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    getMyProfile()
      .then(setProfile)
      .catch((err) => setError(err.message || "Couldn't load your profile."))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="flex items-center justify-end gap-6 px-8 py-5 border-b border-gray-100 bg-white relative">
      <NotificationBell />

      {isLoading ? (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-100 animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
            <div className="h-2.5 w-16 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      ) : (
        <div className="relative" ref={menuRef}>
          <button onClick={() => setIsMenuOpen((prev) => !prev)} className="flex items-center gap-3 group">
            {profile?.profilePhoto ? (
              <img src={profile.profilePhoto} alt={profile.fullName} className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center font-semibold text-amber-700">
                {profile?.fullName?.[0] || "?"}
              </div>
            )}
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">{profile?.fullName}</p>
              <p className="text-xs text-gray-400">{profile?.location}</p>
            </div>
            <ChevronDown className={`h-4 w-4 text-gray-400 group-hover:text-green-600 transition-transform ${isMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="font-semibold text-gray-900">{profile?.fullName}</p>
                <p className="text-sm text-gray-400 truncate">{user?.email}</p>
              </div>
              <nav className="py-2">
                <button
                  onClick={() => { setIsMenuOpen(false); navigate("/profile"); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="h-4 w-4" /> My Profile
                </button>
                <button
                  onClick={() => { setIsMenuOpen(false); navigate("/events?tab=mine"); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Calendar className="h-4 w-4" /> My Events
                </button>
              </nav>
              <div className="border-t border-gray-100 py-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default DashboardHeader;
