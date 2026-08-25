import { useEffect, useState } from "react";
import { ShieldCheck, Calendar, UserPlus, Users } from "lucide-react";
import Sidebar from "../components/dashboard/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatCard from "../components/dashboard/StatCard";
import EventCard from "../components/dashboard/EventCard";
import { getMyProfile, getMyStats, getMyUpcomingEvents } from "../services/memberService";

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    getMyProfile().then(setProfile);
    getMyStats().then(setStats);
    getMyUpcomingEvents().then(setEvents);
  }, []);

  const firstName = profile?.fullName?.split(" ")[0] || "";

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Welcome back, {firstName} 👋
          </h1>
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

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Upcoming Events</h2>
            <button className="text-sm font-medium text-green-600 hover:text-green-700">View All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;