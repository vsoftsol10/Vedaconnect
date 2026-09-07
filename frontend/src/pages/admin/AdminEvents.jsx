import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Eye, Pencil } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { getAdminEvents } from '../../services/adminEventService';

export default function AdminEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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
                  <th className="px-6 py-4">Actions</th>
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
                      <td className="px-6 py-4 text-gray-600">{ev.hubName || '—'}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {ev.registrationCount}/{ev.maxMembers ?? '∞'}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {Number(ev.registrationAmount) > 0 ? `₹${ev.registrationAmount}` : 'Free'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => navigate(`/admin/events/${ev.id}`)}
                            className="flex items-center gap-1.5 border border-gray-200 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all duration-300 px-3 py-1.5 rounded-lg text-gray-700 font-medium"
                          >
                            <Eye size={14} /> View
                          </button>
                          <button
                            onClick={() => navigate(`/admin/events/${ev.id}/edit`)}
                            className="flex items-center gap-1.5 text-gray-500 hover:text-amber-500 font-medium"
                          >
                            <Pencil size={14} /> Edit
                          </button>
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
    </div>
  );
}
