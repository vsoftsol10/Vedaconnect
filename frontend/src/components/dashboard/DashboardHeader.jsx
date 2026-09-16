import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { getMyProfile } from "../../services/memberService";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../notifications/NotificationBell";
import Dropdown from "../ui/Dropdown";

const DashboardHeader = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyProfile()
      .then(setProfile)
      .catch((err) => setError(err.message || "Couldn't load your profile."))
      .finally(() => setIsLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatGreetingName = (fullName) => {
    const firstPerson = fullName?.split("&")[0]?.trim() || "";
    const nameParts = firstPerson.split(/\s+/).filter(Boolean);
    if (!nameParts.length) return "there";

    // A leading initial (for example, "L.") is not a useful greeting name.
    const firstExpandedName = nameParts.find((part) => !/^[A-Za-z]\.?$/.test(part));
    return firstExpandedName || firstPerson;
  };

  const handleAccountAction = (action) => {
    if (action === "profile") navigate("/profile");
    if (action === "logout") handleLogout();
  };

  return (
    <header className="relative flex min-h-[68px] items-center gap-3 overflow-hidden bg-white px-4 py-3 pl-16 sm:px-6 sm:pl-16 md:gap-6 md:px-8 md:py-5">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(95,194,51,0.18)_0%,rgba(95,194,51,0.07)_45%,rgba(255,255,255,0)_75%)]" />
      <div className="relative z-10 min-w-0 flex-1 pr-1">
        <p className="truncate text-base font-semibold tracking-tight text-gray-900 sm:text-lg">
          Welcome, {isLoading ? "…" : formatGreetingName(profile?.fullName)}
        </p>
      </div>

      <div className="relative z-10 flex shrink-0 items-center gap-3 md:gap-6">
      <NotificationBell buttonClass="bg-white/75 text-green-700 shadow-sm ring-1 ring-green-100/80 hover:bg-white hover:text-green-800" />

      {isLoading ? (
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-100 animate-pulse" />
            <div className="hidden space-y-1.5 sm:block">
            <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
            <div className="h-2.5 w-16 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      ) : (
        <Dropdown
          value=""
          onChange={handleAccountAction}
          options={[{ value: "profile", label: "Profile" }, { value: "logout", label: "Logout" }]}
          className="w-auto"
          triggerClassName="flex min-w-0 items-center gap-2 rounded-xl px-1 py-1 text-left outline-none transition hover:bg-white/60 focus:bg-white/70 focus:ring-2 focus:ring-green-100 sm:gap-3"
          menuClassName="right-0 w-48"
          trigger={({ open }) => <>
            {profile?.profilePhoto ? (
              <img src={profile.profilePhoto} alt={profile.fullName} className="h-10 w-10 rounded-full object-cover ring-2 ring-green-100 ring-offset-2" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 font-semibold text-amber-700 ring-2 ring-green-100 ring-offset-2">
                {profile?.fullName?.[0] || "?"}
              </div>
            )}
            <div className="hidden min-w-0 text-left sm:block">
              <p className="truncate text-sm font-semibold text-gray-900">{profile?.fullName}</p>
              <p className="text-xs text-gray-400">{profile?.location}</p>
            </div>
            <ChevronDown className={`hidden h-4 w-4 text-gray-400 transition-transform hover:text-green-600 sm:block ${open ? "rotate-180" : ""}`} />
          </>}
        />
      )}
      </div>
    </header>
  );
};

export default DashboardHeader;
