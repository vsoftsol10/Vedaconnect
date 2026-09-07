import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Calendar } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { getHubById } from '../../services/hubService';

export default function AdminHubDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hub, setHub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHub = async () => {
      try {
        setLoading(true);
        const data = await getHubById(id);
        setHub(data);
      } catch (err) {
        console.error('Failed to load hub', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHub();
  }, [id]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <AdminHeader />
        <main className="px-4 py-6 sm:px-6 md:p-8">
          <button
            onClick={() => navigate('/admin/hubs')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-6"
          >
            <ArrowLeft size={18} />
            Back to Hubs
          </button>

          {loading ? (
            <p className="text-gray-500">Loading hub...</p>
          ) : !hub ? (
            <p className="text-gray-500">Hub not found.</p>
          ) : (
            <>
              <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-6 flex items-center gap-3 sm:gap-4">
                  <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Building2 className="text-amber-500" size={26} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{hub.name}</h2>
                    <p className="text-gray-500 text-sm">{hub.location}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${
                          hub.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${hub.isActive ? 'bg-green-600' : 'bg-red-500'}`} />
                        {hub.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                        {hub.memberCount} members
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Member Count</p>
                    <p className="text-2xl font-bold text-gray-900">{hub.memberCount}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Upcoming Event</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {hub.upcomingEvents?.[0]?.title || 'None scheduled'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Status</p>
                    <p className="text-lg font-semibold text-gray-900">{hub.isActive ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900">Members</h3>
                <p className="text-gray-500 text-sm mb-4">{hub.memberCount} members in this hub</p>
                <div className="space-y-3">
                  {hub.members.length === 0 ? (
                    <p className="text-gray-400 text-sm">No members yet.</p>
                  ) : (
                    hub.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 border border-gray-100 rounded-xl p-3 hover:bg-gray-50 transition-all duration-300 cursor-pointer"
                        onClick={() => navigate(`/admin/members/${member.id}`)}
                      >
                        <img
                          src={member.profilePhoto || '/default-avatar.png'}
                          alt={member.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{member.fullName}</p>
                          <p className="text-sm text-gray-500">{member.businessName}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
                  {hub.upcomingEvents.length === 0 ? (
                    <p className="text-gray-400 text-sm">No upcoming events.</p>
                  ) : (
                    <div className="space-y-3">
                      {hub.upcomingEvents.map((ev) => (
                        <div key={ev.id} className="border border-gray-100 rounded-xl p-3">
                          <p className="font-medium text-gray-900 flex items-center gap-2">
                            <Calendar size={15} className="text-amber-500" />
                            {ev.title}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {ev.eventDate} · {ev.startTime} - {ev.endTime}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Past Events</h3>
                  {hub.pastEvents.length === 0 ? (
                    <p className="text-gray-400 text-sm">No past events.</p>
                  ) : (
                    <div className="space-y-3">
                      {hub.pastEvents.map((ev) => (
                        <div key={ev.id} className="border border-gray-100 rounded-xl p-3">
                          <p className="font-medium text-gray-900">{ev.title}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
