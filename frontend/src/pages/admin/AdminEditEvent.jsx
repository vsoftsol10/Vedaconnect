import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import EventForm from '../../components/admin/EventForm';
import { getAdminEventById, updateEvent } from '../../services/adminEventService';

export default function AdminEditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (payload) => {
    try {
      setSubmitting(true);
      await updateEvent(id, payload);
      navigate(`/admin/events/${id}`);
    } catch (err) {
      console.error('Failed to update event', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader />
        <main className="p-8 max-w-3xl">
          <button
            onClick={() => navigate('/admin/events')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-6"
          >
            <ArrowLeft size={18} />
            Back to Events
          </button>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Edit Event</h1>
          <p className="text-gray-500 mb-6">Update event details below.</p>

          {loading ? (
            <p className="text-gray-500">Loading event...</p>
          ) : (
            <EventForm
              initialValues={event}
              onSubmit={handleSubmit}
              submitting={submitting}
              submitLabel="Save Changes"
              footerLabel={event?.title}
            />
          )}
        </main>
      </div>
    </div>
  );
}