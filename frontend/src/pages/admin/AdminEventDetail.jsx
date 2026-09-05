import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Calendar, Clock, MapPin, Sparkles, ListChecks, Users, Info } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { getAdminEventById } from '../../services/adminEventService';

export default function AdminEventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const data = await getAdminEventById(id);
        setEvent(data);
      } catch (err) {
        console.error('Failed to load event', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader />
          <main className="p-8"><p className="text-gray-500">Loading event...</p></main>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader />
          <main className="p-8"><p className="text-gray-500">Event not found.</p></main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader />
        <main className="p-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/admin/events')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
            >
              <ArrowLeft size={18} />
              Back to Events
            </button>
            <button
              onClick={() => navigate(`/admin/events/${id}/edit`)}
              className="flex items-center gap-2 border border-gray-200 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all duration-300 px-4 py-2 rounded-xl text-gray-700 font-medium"
            >
              <Pencil size={16} /> Edit Event
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
            <div className="h-40 bg-gradient-to-r from-amber-100 to-amber-50" />
            <div className="p-6 flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
                <p className="text-gray-500 mb-3">{event.hubName || 'No hub assigned'}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={15} />
                    {new Date(event.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  {event.startTime && event.endTime && (
                    <span className="flex items-center gap-1.5">
                      <Clock size={15} />
                      {event.startTime} - {event.endTime}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <MapPin size={15} />
                    {event.location}
                  </span>
                </div>
                <p className="text-gray-600 max-w-2xl">{event.description}</p>
              </div>
              <div className="text-right shrink-0 ml-6">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Event Fee</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Number(event.registrationAmount) > 0 ? `₹${event.registrationAmount}` : 'Free'}
                </p>
                {Number(event.registrationAmount) > 0 && <p className="text-xs text-gray-400">per member</p>}
                <span className="inline-block mt-2 text-xs font-medium px-3 py-1 rounded-full bg-amber-50 text-amber-600">
                  {event.registrationCount} registered
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {event.aboutEvent && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">About the Event</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{event.aboutEvent}</p>
              </div>
            )}

            {event.highlights?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-500" />
                  What You'll Get
                </h3>
                <ul className="space-y-2">
                  {event.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="w-4 h-4 rounded-full border border-green-500 text-green-600 flex items-center justify-center text-[10px] mt-0.5">✓</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {event.schedule?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ListChecks size={18} className="text-amber-500" />
                Schedule
              </h3>
              <div className="relative pl-6 border-l-2 border-amber-200 space-y-6">
                {event.schedule.map((item, i) => (
                  <div key={i} className="relative">
                    <span className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-amber-400" />
                    <p className="font-semibold text-gray-900">{item.time}</p>
                    <p className="text-gray-600 text-sm">{item.item}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users size={18} className="text-amber-500" />
                Who's Attending
              </h3>
              {event.attendees.length === 0 ? (
                <p className="text-gray-400 text-sm">No registrations yet.</p>
              ) : (
                <div className="space-y-3">
                  {event.attendees.slice(0, 5).map((a) => (
                    <div key={a.userId} className="flex items-center gap-3">
                      <img src={a.profilePhoto || '/default-avatar.png'} alt={a.fullName} className="w-9 h-9 rounded-full object-cover" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{a.fullName}</p>
                        {a.businessName && <p className="text-xs text-gray-500">{a.businessName}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-4">
                {event.registrationCount} of {event.maxMembers ?? '∞'} members registered
              </p>
            </div>

            {(event.dressCode || event.parkingInfo || event.contactEmail) && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Info size={18} className="text-amber-500" />
                  Event Information
                </h3>
                <div className="space-y-3 text-sm">
                  {event.dressCode && (
                    <div className="flex justify-between border-b border-gray-50 pb-3">
                      <span className="text-gray-500">Dress Code</span>
                      <span className="text-gray-900 font-medium">{event.dressCode}</span>
                    </div>
                  )}
                  {event.parkingInfo && (
                    <div className="flex justify-between border-b border-gray-50 pb-3">
                      <span className="text-gray-500">Parking</span>
                      <span className="text-gray-900 font-medium">{event.parkingInfo}</span>
                    </div>
                  )}
                  {event.contactEmail && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Contact</span>
                      <span className="text-gray-900 font-medium">{event.contactEmail}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}