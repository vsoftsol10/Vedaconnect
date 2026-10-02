import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Calendar, UserPlus, Users, Loader2, X } from "lucide-react";
import Sidebar from "../components/dashboard/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatCard from "../components/dashboard/StatCard";
import EventCard from "../components/dashboard/EventCard";
import AttendanceWidget from "../components/dashboard/AttendanceWidget";
import Leaderboard from "../components/dashboard/Leaderboard";
import { getBirthdayToday, getMyProfile, getMyStats, getMyUpcomingEvents } from "../services/memberService";
import { getPosters } from "../services/posterService";

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [birthday, setBirthday] = useState(null);
  const [birthdayDismissed, setBirthdayDismissed] = useState(false);
  const [latestPoster, setLatestPoster] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [profileData, statsData, eventsData] = await Promise.all([
          getMyProfile(),
          getMyStats(),
          getMyUpcomingEvents(),
        ]);
        setProfile(profileData);
        setStats(statsData);
        setEvents(eventsData);
      } catch (err) {
        setError(err.message || "Couldn't load your dashboard. Please try logging in again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
    getBirthdayToday().then((data) => { setBirthday(data); setBirthdayDismissed(localStorage.getItem(`birthday-dismissed-${new Date().toDateString()}`) === "true"); }).catch(() => {});
    getPosters().then((items) => setLatestPoster(items.find((item) => item.isPinned) || items[0] || null)).catch(() => {});
  }, []);

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <DashboardHeader />
        <main className="px-4 py-6 sm:px-6 md:p-8">
          {isLoading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading dashboard
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">
              {error}
            </div>
          ) : (
            <>
              {birthday?.isBirthday && !birthdayDismissed && <div className="relative mb-6 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white p-5 shadow-sm"><div aria-hidden="true" className="birthday-confetti" /><button onClick={() => { localStorage.setItem(`birthday-dismissed-${new Date().toDateString()}`, "true"); setBirthdayDismissed(true); }} className="absolute right-3 top-3 rounded-lg p-2 text-gray-400 hover:bg-white hover:text-gray-700" aria-label="Dismiss birthday greeting"><X className="h-4 w-4" /></button><p className="text-xl font-bold text-gray-900">Happy Birthday, {birthday.fullName.split(" ")[0]} 🎂</p><p className="mt-1 text-sm text-gray-600">Wishing you a wonderful year ahead from VedaConnect.</p></div>}
              {!profile?.birthMonth && <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><span>Add your birthday so we can celebrate with you.</span><button onClick={() => navigate("/profile")} className="font-semibold text-green-700">Add your birthday</button></div>}
              <p className="text-gray-500 mb-8">
                Here's what's happening in your VedaConnect community.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                <StatCard
                  icon={ShieldCheck}
                  iconBg="bg-green-50 text-green-600"
                  value="Community Membership"
                  label={stats?.membershipStatus === "ACTIVE" ? "Active" : stats?.membershipStatus}
                  badge={stats?.membershipStatus === "ACTIVE" ? "Active" : null}
                />
                <StatCard
                  icon={Calendar}
                  iconBg="bg-amber-50 text-amber-600"
                  value={stats?.eventsJoined ?? "-"}
                  label="Events Joined"
                />
                <StatCard
                  icon={UserPlus}
                  iconBg="bg-green-50 text-green-600"
                  value={stats?.referralsGiven ?? "-"}
                  label="Referrals Given"
                />
                <StatCard
                  icon={Users}
                  iconBg="bg-green-50 text-green-600"
                  value={stats?.referralsReceived ?? "-"}
                  label="Referrals Received"
                />
              </div>

              <AttendanceWidget />
              {latestPoster && <section className="mb-8 overflow-hidden rounded-2xl border bg-white p-4 shadow-sm sm:flex sm:items-center sm:gap-5"><div className="h-20 w-full shrink-0 overflow-hidden rounded-xl bg-stone-100 sm:w-28">{latestPoster.fileType === "IMAGE" && <img src={latestPoster.fileUrl} alt="" className="h-full w-full object-cover" />}</div><div className="mt-3 min-w-0 sm:mt-0"><p className="text-xs font-semibold uppercase tracking-wide text-green-700">Latest guide</p><h2 className="font-bold text-gray-900">{latestPoster.title}</h2><p className="truncate text-sm text-gray-500">{latestPoster.caption}</p></div><button onClick={() => navigate("/posters")} className="mt-3 shrink-0 text-sm font-semibold text-green-700 sm:ml-auto sm:mt-0">View all</button></section>}
              <Leaderboard />

              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-lg font-bold text-gray-900">Upcoming Events</h2>
                <button
                  onClick={() => navigate("/events?tab=upcoming")}
                  className="text-sm font-medium text-green-600 hover:text-green-700"
                >
                  View All
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {events.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => navigate(`/events/${event.id}`)}
                    onKeyDown={(eventKey) => {
                      if (eventKey.key === "Enter" || eventKey.key === " ") {
                        eventKey.preventDefault();
                        navigate(`/events/${event.id}`);
                      }
                    }}
                    role="link"
                    tabIndex={0}
                    className="cursor-pointer rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    <EventCard event={event} />
                  </div>
                ))}
                {!events.length && (
                  <p className="rounded-xl border border-dashed border-gray-200 bg-white px-5 py-6 text-sm text-gray-500">
                    No upcoming events have been published yet.
                  </p>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
