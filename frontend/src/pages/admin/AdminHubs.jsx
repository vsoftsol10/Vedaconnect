import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, MapPin, Users, Calendar } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import AddHubModal from '../../components/admin/AddHubModal';
import { getHubs } from '../../services/hubService';

export default function AdminHubs() {
  const navigate = useNavigate();
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchHubs = async () => {
    try {
      setLoading(true);
      const data = await getHubs();
      setHubs(data);
    } catch (err) {
      console.error('Failed to load hubs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHubs();
  }, []);

  const handleHubCreated = () => {
    setIsModalOpen(false);
    fetchHubs();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <AdminHeader />
        <main className="px-4 py-6 sm:px-6 md:p-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hubs</h1>
              <p className="text-gray-500 mt-1">Manage community hubs across cities.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex min-h-11 items-center justify-center gap-2 bg-amber-400 hover:bg-green-600 hover:text-white transition-all duration-300 font-medium px-5 py-2.5 rounded-xl"
            >
              <Plus size={18} />
              Add Hub
            </button>
          </div>

          {loading ? (
            <p className="text-gray-500">Loading hubs...</p>
          ) : hubs.length === 0 ? (
            <p className="text-gray-500">No hubs yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hubs.map((hub) => (
                <div key={hub.id} className="flex flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                      <Building2 className="text-amber-500" size={22} />
                    </div>
                    <span
                      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${
                        hub.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${hub.isActive ? 'bg-green-600' : 'bg-red-500'}`} />
                      {hub.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{hub.name}</h3>

                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={15} />
                      <span>{hub.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={15} />
                      <span>{hub.memberCount} members</span>
                    </div>
                    {hub.upcomingEventTitle && (
                      <div className="flex items-center gap-2">
                        <Calendar size={15} />
                        <span>{hub.upcomingEventTitle}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => navigate(`/admin/hubs/${hub.id}`)}
                    className="mt-auto flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 font-medium text-gray-700 transition-all duration-300 hover:border-green-600 hover:bg-green-600 hover:text-white"
                  >
                    View Hub →
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <AddHubModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleHubCreated} />
    </div>
  );
}
