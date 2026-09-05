import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import EventForm from '../../components/admin/EventForm';
import { createEvent } from '../../services/adminEventService';

export default function AdminCreateEvent() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (payload) => {
    try {
      setSubmitting(true);
      const event = await createEvent(payload);
      navigate(`/admin/events/${event.id}`);
    } catch (err) {
      console.error('Failed to create event', err);
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

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create Event</h1>
          <p className="text-gray-500 mb-6">Set up a new community event for a hub.</p>

          <EventForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Create Event" footerLabel="New event" />
        </main>
      </div>
    </div>
  );
}