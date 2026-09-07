import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, MapPin, Users, Heart, Lightbulb, Sparkles } from "lucide-react";
import Sidebar from "../components/dashboard/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import { getEventDetail, registerForEvent } from "../services/eventService";

const ICONS = { Users, Heart, Lightbulb, Sparkles };

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getEventDetail(eventId).then(setEvent);
  }, [eventId]);

  const handleRegister = async () => {
    setIsRegistering(true);
    setMessage("");
    try {
      await registerForEvent(eventId);
      setMessage("You're registered! See it under 'My Events'.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not register.");
    } finally {
      setIsRegistering(false);
    }
  };

  if (!event) return null;

  const formattedDate = new Date(event.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <DashboardHeader />
        <main className="px-4 py-6 sm:px-6 md:p-8">
          <button onClick={() => navigate("/events")} className="flex items-center gap-2 text-gray-500 hover:text-green-600 font-medium mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Events
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="relative h-56 rounded-2xl overflow-hidden bg-gray-100 sm:h-72">
                {event.imageUrl && <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 sm:p-6">
                  <div className="flex gap-2 mb-3">
                    {event.tags.map((tag) => (
                      <span key={tag} className="bg-white/90 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full">{tag}</span>
                    ))}
                  </div>
                  <h1 className="break-words text-2xl font-bold text-white">{event.title}</h1>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center">
                  <Calendar className="h-5 w-5 text-green-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 uppercase mb-1">Date</p>
                  <p className="font-semibold text-gray-900 text-sm">{formattedDate}</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center">
                  <Clock className="h-5 w-5 text-green-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 uppercase mb-1">Time</p>
                  <p className="font-semibold text-gray-900 text-sm">{event.startTime}</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center">
                  <MapPin className="h-5 w-5 text-green-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 uppercase mb-1">Location</p>
                  <p className="font-semibold text-gray-900 text-sm">{event.location}</p>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="font-bold text-gray-900 mb-3">About the Event</h2>
                <p className="text-gray-600 leading-relaxed">{event.aboutEvent}</p>
              </div>

              {event.highlights?.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-2xl p-6">
                  <h2 className="font-bold text-gray-900 mb-4">What You'll Experience</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {event.highlights.map((h, i) => {
                      const Icon = ICONS[h.icon] || Sparkles;
                      return (
                        <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                          <Icon className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <span className="text-gray-800 font-medium">{h.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 h-fit shadow-sm">
              <h2 className="font-bold text-gray-900 mb-1">Registration</h2>
              <p className="text-sm text-gray-500 mb-5">Secure your spot at this event</p>

              <div className="space-y-3 mb-5">
                <div className="flex flex-col gap-1 sm:flex-row sm:justify-between"><span className="text-gray-500">Event Fee</span><span className="font-bold text-gray-900">₹{Number(event.registrationAmount)}</span></div>
                <div className="flex flex-col gap-1 sm:flex-row sm:justify-between"><span className="text-gray-500">Date</span><span className="font-semibold text-gray-900">{formattedDate}</span></div>
                <div className="flex flex-col gap-1 sm:flex-row sm:justify-between"><span className="text-gray-500">Location</span><span className="font-semibold break-words text-gray-900">{event.location}</span></div>
              </div>

              <button
                onClick={handleRegister}
                disabled={isRegistering}
                className="w-full bg-amber-400 hover:bg-green-600 hover:text-white disabled:opacity-60 text-gray-900 font-semibold py-3.5 rounded-xl transition-all duration-300"
              >
                {isRegistering ? "Registering..." : "Register Now"}
              </button>

              {message && <p className="text-sm text-center mt-3 text-gray-600">{message}</p>}

              <p className="text-xs text-gray-400 text-center mt-3">
                By registering, you agree to the community guidelines.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EventDetail;
