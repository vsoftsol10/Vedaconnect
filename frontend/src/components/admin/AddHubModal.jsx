import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { createHub, updateHub } from '../../services/hubService';

export default function AddHubModal({ isOpen, onClose, onSuccess, hub }) {
  const isEditMode = Boolean(hub);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    coordinatorName: '',
    isActive: true,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (hub) {
      setFormData({
        name: hub.name || '',
        location: hub.location || '',
        description: hub.description || '',
        coordinatorName: hub.coordinatorName || '',
        isActive: hub.isActive ?? true,
      });
    } else {
      setFormData({ name: '', location: '', description: '', coordinatorName: '', isActive: true });
    }
    setErrors({});
  }, [hub, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Hub name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      if (isEditMode) {
        await updateHub(hub.id, formData);
      } else {
        await createHub(formData);
      }
      onSuccess();
    } catch (err) {
      console.error('Failed to save hub', err);
      setErrors({ form: err?.response?.data?.message || 'Something went wrong' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
      <div className="max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white sm:max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{isEditMode ? 'Edit Hub' : 'Add Hub'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-4 sm:p-6">
          {errors.form && (
            <div className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{errors.form}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">
              Hub Name <span className="text-amber-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Tirunelveli Hub"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">
              Location <span className="text-amber-500">*</span>
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="e.g. Tirunelveli, TN"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">Hub Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Brief description of the hub"
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">Hub Coordinator</label>
            <input
              type="text"
              value={formData.coordinatorName}
              onChange={(e) => handleChange('coordinatorName', e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <p className="text-xs text-gray-400 mt-1">Optional</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">
              Status <span className="text-amber-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleChange('isActive', true)}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 font-medium border transition-all duration-300 ${
                  formData.isActive ? 'bg-green-50 border-green-400 text-green-700' : 'border-gray-200 text-gray-500'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${formData.isActive ? 'bg-green-600' : 'bg-gray-300'}`} />
                Active
              </button>
              <button
                type="button"
                onClick={() => handleChange('isActive', false)}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 font-medium border transition-all duration-300 ${
                  !formData.isActive ? 'bg-gray-100 border-gray-300 text-gray-700' : 'border-gray-200 text-gray-500'
                }`}
              >
                <span className={`w-2 h-2 rounded-full border ${!formData.isActive ? 'border-gray-500' : 'border-gray-300'}`} />
                Inactive
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-700 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-amber-400 hover:bg-green-600 hover:text-white transition-all duration-300 font-medium py-2.5 rounded-xl disabled:opacity-50"
            >
              {submitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Add Hub'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
