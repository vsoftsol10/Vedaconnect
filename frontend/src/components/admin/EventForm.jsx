import { useEffect, useRef, useState } from 'react';
import { Trash2, Plus, Info, Clock, Users, CreditCard, UploadCloud } from 'lucide-react';
import { getHubs } from '../../services/hubService';

const emptyForm = {
  title: '', description: '', aboutEvent: '', eventDate: '', timeRange: '',
  location: '', hubId: '', schedule: [{ time: '', item: '' }],
  registrationDeadline: '', isPaid: true, registrationAmount: '',
};

export default function EventForm({ initialValues, onSubmit, submitting, submitLabel, footerLabel }) {
  const [formData, setFormData] = useState(emptyForm);
  const [hubs, setHubs] = useState([]);
  const [errors, setErrors] = useState({});
  const [poster, setPoster] = useState(null);
  const [posterPreview, setPosterPreview] = useState('');
  const [posterError, setPosterError] = useState('');
  const posterInputRef = useRef(null);

  useEffect(() => {
    getHubs().then(setHubs).catch((err) => console.error('Failed to load hubs', err));
  }, []);

  useEffect(() => {
    if (initialValues) {
      setFormData({
        title: initialValues.title || '',
        description: initialValues.description || '',
        aboutEvent: initialValues.aboutEvent || '',
        eventDate: initialValues.eventDate ? initialValues.eventDate.slice(0, 10) : '',
        timeRange: initialValues.startTime && initialValues.endTime
          ? `${initialValues.startTime} - ${initialValues.endTime}` : '',
        location: initialValues.location || '',
        hubId: initialValues.hubId || '',
        schedule: initialValues.schedule?.length ? initialValues.schedule : [{ time: '', item: '' }],
        registrationDeadline: initialValues.registrationDeadline
          ? initialValues.registrationDeadline.slice(0, 10) : '',
        isPaid: Number(initialValues.registrationAmount) > 0,
        registrationAmount: initialValues.registrationAmount || '',
      });
      setPoster(null);
      setPosterPreview(initialValues.imageUrl || '');
    }
  }, [initialValues]);

  useEffect(() => () => {
    if (posterPreview.startsWith('blob:')) URL.revokeObjectURL(posterPreview);
  }, [posterPreview]);

  const selectPoster = (file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setPosterError('Please select a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPosterError('Event poster must be under 5MB.');
      return;
    }
    if (posterPreview.startsWith('blob:')) URL.revokeObjectURL(posterPreview);
    setPoster(file);
    setPosterPreview(URL.createObjectURL(file));
    setPosterError('');
  };

  const handleChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleScheduleChange = (index, field, value) => {
    setFormData((prev) => {
      const schedule = [...prev.schedule];
      schedule[index] = { ...schedule[index], [field]: value };
      return { ...prev, schedule };
    });
  };

  const addScheduleItem = () =>
    setFormData((prev) => ({ ...prev, schedule: [...prev.schedule, { time: '', item: '' }] }));

  const removeScheduleItem = (index) =>
    setFormData((prev) => ({ ...prev, schedule: prev.schedule.filter((_, i) => i !== index) }));

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Event name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.eventDate) newErrors.eventDate = 'Date is required';
    if (!formData.timeRange.trim()) newErrors.timeRange = 'Time is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.registrationDeadline) newErrors.registrationDeadline = 'Registration deadline is required';
    if (formData.isPaid && !formData.registrationAmount) newErrors.registrationAmount = 'Event fee is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const [startTime, endTime] = formData.timeRange.split('-').map((s) => s.trim());

    onSubmit({
      title: formData.title,
      description: formData.description,
      aboutEvent: formData.aboutEvent || undefined,
      eventDate: formData.eventDate,
      startTime,
      endTime,
      location: formData.location,
      hubId: formData.hubId || undefined,
      schedule: formData.schedule.filter((s) => s.time.trim() || s.item.trim()),
      registrationDeadline: formData.registrationDeadline,
      poster,
      isPaid: formData.isPaid,
      registrationAmount: formData.isPaid ? Number(formData.registrationAmount) : 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="pb-24">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <Info size={16} className="text-amber-500" />
          </div>
          <h3 className="text-xs font-semibold text-gray-500 tracking-wide uppercase">Event Information</h3>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">
              Event Name <span className="text-amber-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g. VedaCraft Monthly Meetup"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">Event Poster</label>
            <input ref={posterInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => selectPoster(e.target.files?.[0])} className="hidden" />
            <div
              role="button"
              tabIndex={0}
              onClick={() => posterInputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && posterInputRef.current?.click()}
              className="rounded-xl border-2 border-dashed border-gray-200 px-6 py-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-green-300 hover:bg-green-50/20 transition-colors"
            >
              {posterPreview ? (
                <div className="w-full flex flex-col items-center gap-3">
                  <img src={posterPreview} alt="Event poster preview" className="h-40 w-64 rounded-xl object-cover border border-gray-100" />
                  <p className="font-semibold text-gray-900">{poster ? poster.name : 'Current event poster'}</p>
                  <p className="text-sm text-gray-400">Click to replace</p>
                </div>
              ) : (
                <>
                  <div className="h-14 w-14 rounded-xl bg-gray-100 flex items-center justify-center mb-3"><UploadCloud className="h-6 w-6 text-gray-400" /></div>
                  <p className="font-semibold text-gray-900 mb-1">Click to upload an event poster</p>
                  <p className="text-sm text-gray-400">JPG, PNG, or WebP up to 5MB.</p>
                </>
              )}
            </div>
            {posterError && <p className="text-xs text-red-500 mt-1">{posterError}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">
              Description <span className="text-amber-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Short description of the event"
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">About Event</label>
            <textarea
              value={formData.aboutEvent}
              onChange={(e) => handleChange('aboutEvent', e.target.value)}
              placeholder="Longer description shown on the event details page"
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1.5">
                Date <span className="text-amber-500">*</span>
              </label>
              <input
                type="date"
                value={formData.eventDate}
                onChange={(e) => handleChange('eventDate', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              {errors.eventDate && <p className="text-xs text-red-500 mt-1">{errors.eventDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1.5">
                Time <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                value={formData.timeRange}
                onChange={(e) => handleChange('timeRange', e.target.value)}
                placeholder="6:00 PM - 8:30 PM"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              {errors.timeRange && <p className="text-xs text-red-500 mt-1">{errors.timeRange}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1.5">
                Location <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Venue address"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1.5">
                Hub
              </label>
              <select
                value={formData.hubId}
                onChange={(e) => handleChange('hubId', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
              >
                <option value="">No hub assigned</option>
                {hubs.map((hub) => (
                  <option key={hub.id} value={hub.id}>{hub.name}</option>
                ))}
              </select>
              {errors.hubId && <p className="text-xs text-red-500 mt-1">{errors.hubId}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <Clock size={16} className="text-amber-500" />
          </div>
          <h3 className="text-xs font-semibold text-gray-500 tracking-wide uppercase">Event Schedule</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">Add agenda items for the event.</p>

        <div className="space-y-3">
          {formData.schedule.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="text"
                value={item.time}
                onChange={(e) => handleScheduleChange(index, 'time', e.target.value)}
                placeholder="Time"
                className="w-32 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <input
                type="text"
                value={item.item}
                onChange={(e) => handleScheduleChange(index, 'item', e.target.value)}
                placeholder="Agenda item"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button type="button" onClick={() => removeScheduleItem(index)} className="text-gray-400 hover:text-red-500">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addScheduleItem}
          className="mt-3 flex items-center gap-2 border border-gray-200 hover:bg-gray-50 transition-all duration-300 text-gray-700 font-medium px-4 py-2 rounded-xl text-sm"
        >
          <Plus size={16} /> Add Schedule Item
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <Users size={16} className="text-amber-500" />
          </div>
          <h3 className="text-xs font-semibold text-gray-500 tracking-wide uppercase">Registration</h3>
        </div>

        <div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">
              Registration Deadline <span className="text-amber-500">*</span>
            </label>
            <input
              type="date"
              value={formData.registrationDeadline}
              onChange={(e) => handleChange('registrationDeadline', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            {errors.registrationDeadline && <p className="text-xs text-red-500 mt-1">{errors.registrationDeadline}</p>}
          </div>
        </div>
      </div>

      <div className="bg-amber-50/40 border border-amber-200 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <CreditCard size={16} className="text-amber-600" />
          </div>
          <h3 className="text-xs font-semibold text-gray-500 tracking-wide uppercase">Event Payment</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">Does this event require payment?</p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            onClick={() => handleChange('isPaid', false)}
            className={`flex items-center justify-center gap-2 rounded-xl py-3 font-medium border transition-all duration-300 ${
              !formData.isPaid ? 'bg-amber-100 border-amber-400 text-gray-900' : 'border-gray-200 text-gray-500 bg-white'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full border ${!formData.isPaid ? 'border-amber-500 bg-amber-400' : 'border-gray-300'}`} />
            Free Event
          </button>
          <button
            type="button"
            onClick={() => handleChange('isPaid', true)}
            className={`flex items-center justify-center gap-2 rounded-xl py-3 font-medium border transition-all duration-300 ${
              formData.isPaid ? 'bg-amber-100 border-amber-400 text-gray-900' : 'border-gray-200 text-gray-500 bg-white'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full border ${formData.isPaid ? 'border-amber-500 bg-amber-400' : 'border-gray-300'}`} />
            Paid Event
          </button>
        </div>

        {formData.isPaid && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">
              Event Fee <span className="text-amber-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
              <input
                type="number"
                min="0"
                value={formData.registrationAmount}
                onChange={(e) => handleChange('registrationAmount', e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            {errors.registrationAmount && <p className="text-xs text-red-500 mt-1">{errors.registrationAmount}</p>}
            {formData.registrationAmount && (
              <div className="mt-3 bg-white border border-amber-200 rounded-xl px-4 py-2.5 text-amber-600 font-semibold text-sm">
                ₹{formData.registrationAmount} / Member
              </div>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white border-t border-gray-100 px-8 py-4 flex items-center justify-between">
        <span className="text-sm text-gray-500">{footerLabel} · ₹{formData.registrationAmount || 0}</span>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="border border-gray-200 text-gray-700 font-medium px-6 py-2.5 rounded-xl hover:bg-gray-50 transition-all duration-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 bg-amber-400 hover:bg-green-600 hover:text-white transition-all duration-300 font-medium px-6 py-2.5 rounded-xl disabled:opacity-50"
          >
            {submitting ? 'Saving...' : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
