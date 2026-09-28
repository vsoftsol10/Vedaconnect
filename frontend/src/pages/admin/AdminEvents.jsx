import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Calendar, CheckCircle2 } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { deleteEvent, getAdminEvents } from '../../services/adminEventService';
import EventActionMenu from '../../components/admin/EventActionMenu';
import EventDeleteModal from '../../components/admin/EventDeleteModal';

export default function AdminEvents() {
  const navigate = useNavigate();
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(location.state?.toast || '');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await getAdminEvents();
        setEvents(data);
      } catch (err) {
        console.error('Failed to load events', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleDelete = async () => {
    if (!eventToDelete || deleting) return;
    try {
      setDeleting(true);
      await deleteEvent(eventToDelete.id);
      setEvents((current) => current.filter((event) => event.id !== eventToDelete.id));
      setEventToDelete(null);
      setToast('Event deleted successfully');
    } catch (err) {
      setToast(err.message || 'Could not delete event.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <AdminHeader />
        <main className="px-4 py-6 sm:px-6 md:p-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Events</h1>
              <p className="text-gray-500 mt-1">Manage all community events.</p>
            </div>
            <button
              onClick={() => navigate('/admin/events/create')}
              className="flex min-h-11 items-center justify-center gap-2 bg-amber-400 hover:bg-green-600 hover:text-white transition-all duration-300 font-medium px-5 py-2.5 rounded-xl"
            >
              <Plus size={18} />
              Create Event
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
            <table className="min-w-[760px] w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  <th className="px-6 py-4">Event</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Hub</th>
                  <th className="px-6 py-4">Registrations</th>
                  <th className="px-6 py-4">Event Fee</th>
                  <th className="w-24 py-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-6 text-gray-500">Loading events...</td></tr>
                ) : events.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-6 text-gray-500">No events yet.</td></tr>
                ) : (
                  events.map((ev) => (
                    <tr key={ev.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{ev.title}</span>
                          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${ev.eventType === 'NO_FEE' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                            {ev.eventType === 'NO_FEE' ? 'No Fee' : 'Fee'}
                          </span>
                          {ev.isPast && (
                            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                              Past
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={15} className="text-gray-400" />
                          {new Date(ev.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{ev.hubName || 'All hubs'}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {ev.registrationCount}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {ev.eventType === 'NO_FEE' ? 'No fee' : `₹${ev.registrationAmount}`}
                      </td>
                      <td className="w-24 py-4 pr-6">
                        <div className="flex justify-end">
                          <EventActionMenu event={ev} onView={() => navigate(`/admin/events/${ev.id}`)} onEdit={() => navigate(`/admin/events/${ev.id}/edit`)} onDelete={() => setEventToDelete(ev)} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
      {eventToDelete && <EventDeleteModal event={eventToDelete} onClose={() => !deleting && setEventToDelete(null)} onConfirm={handleDelete} isSubmitting={deleting} />}
      {toast && <div role="status" className={`fixed bottom-5 right-5 z-[70] flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${toast === 'Event deleted successfully' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}><CheckCircle2 className="h-4 w-4" />{toast}</div>}
    </div>
  );
}
