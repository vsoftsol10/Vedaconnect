import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, History } from "lucide-react";
import Sidebar from "../components/dashboard/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import EventCard from "../components/dashboard/EventCard";
import { getUpcomingEvents, getPastEvents, getMyEvents } from "../services/eventService";
import { useSearchParams } from "react-router-dom";

const TABS = [
  { key: "mine", label: "My Events", icon: Calendar },
  { key: "upcoming", label: "Upcoming", icon: Clock },
  { key: "past", label: "Past", icon: History },
];

const formatEvent = (e) => ({
  id: e.id,
  title: e.title,
  imageUrl: e.imageUrl,
  tags: e.tags,
  date: new Date(e.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
  time: e.startTime,
  location: e.location,
});

const Events = () => {
  const navigate = useNavigate();  
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "upcoming");
  const [events, setEvents] = useState({ mine: [], upcoming: [], past: [] });

  useEffect(() => {
    getUpcomingEvents().then((data) => setEvents((prev) => ({ ...prev, upcoming: data.map(formatEvent) })));
    getPastEvents().then((data) => setEvents((prev) => ({ ...prev, past: data.map(formatEvent) })));
    getMyEvents().then((data) => setEvents((prev) => ({ ...prev, mine: data.map(formatEvent) })));
  }, []);

  const activeEvents = events[activeTab];

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Events</h1>
          <p className="text-gray-500 mb-6">Discover and participate in community events.</p>

          <div className="inline-flex bg-white border border-gray-100 rounded-2xl p-1.5 mb-6 shadow-sm">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === key ? "bg-amber-400 text-gray-900" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
                <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === key ? "bg-white/40" : "bg-gray-100"}`}>
                  {events[key].length}
                </span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {activeEvents.map((event) => (
              <div key={event.id} onClick={() => navigate(`/events/${event.id}`)} className="cursor-pointer">
                <EventCard event={event} />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Events;