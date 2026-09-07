import { useState, useEffect } from "react";
import { X, Plus, UploadCloud } from "lucide-react";
import { createMember, listAdminHubs, getMembershipPlansAdmin } from "../../services/adminService";
import { HUB_OPTIONS } from "../../utils/hubs";

const BUSINESS_TYPES = ["Individual / Sole Proprietor", "Partnership", "Private Limited Company", "Self-Help Group", "Other"];
const BUSINESS_CATEGORIES = ["Herbal & Wellness", "Natural Products", "Food & Beverage", "Handicrafts", "Fashion & Textiles", "Beauty & Personal Care", "Other"];
const todayInputValue = () => new Date().toISOString().slice(0, 10);

const initialForm = {
  fullName: "", email: "", phone: "",
  businessName: "", businessType: "", businessCategory: "", location: "",
  businessDescription: "", hubId: "", planCode: "", joinedAt: todayInputValue(),
};

const AddMemberModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState(initialForm);
  const [products, setProducts] = useState([]);
  const [productInput, setProductInput] = useState("");
  const [certificate, setCertificate] = useState(null);
  const [hubs, setHubs] = useState([]);
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    listAdminHubs().then(setHubs);
    getMembershipPlansAdmin().then(setPlans);
  }, []);

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const addProduct = () => {
    if (productInput.trim()) {
      setProducts((prev) => [...prev, productInput.trim()]);
      setProductInput("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await createMember(
        { ...form, productsServices: products.join(", ") },
        certificate
      );
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add member.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4">
      <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col rounded-2xl bg-white sm:max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Add Member</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto px-4 py-5 sm:px-6">
          <div>
            <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase mb-3">Personal Details</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Full Name" required value={form.fullName} onChange={handleChange("fullName")} placeholder="e.g. Priya Kumar" />
              <Input label="Email" required type="email" value={form.email} onChange={handleChange("email")} placeholder="priya@example.com" />
            </div>
            <div className="mt-4">
              <Input label="Mobile Number" required value={form.phone} onChange={handleChange("phone")} placeholder="98765 43210" />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase mb-3">Business Details</p>
            <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2">
              <Input label="Business Name" required value={form.businessName} onChange={handleChange("businessName")} placeholder="e.g. Priya Crafts" />
              <Select label="Business Type" required value={form.businessType} onChange={handleChange("businessType")} options={BUSINESS_TYPES} placeholder="Select type" />
            </div>
            <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2">
              <Select label="Business Category" required value={form.businessCategory} onChange={handleChange("businessCategory")} options={BUSINESS_CATEGORIES} placeholder="Select category" />
              <Select label="Location" required value={form.location} onChange={handleChange("location")} options={HUB_OPTIONS} placeholder="Select location" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Business Description</label>
              <textarea
                value={form.businessDescription}
                onChange={handleChange("businessDescription")}
                rows={3}
                placeholder="Brief description of the business"
                className="w-full rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 p-3 text-sm outline-none resize-none"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-900">Products / Services</label>
                <button type="button" onClick={addProduct} className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-green-600">
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </div>
              <input
                value={productInput}
                onChange={(e) => setProductInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addProduct())}
                placeholder="e.g. Handmade Pottery"
                className="w-full rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 px-4 py-2.5 text-sm outline-none"
              />
              {products.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {products.map((p, i) => (
                    <span key={i} className="bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">{p}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase mb-3">Hub & Membership</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select label="Select Hub" required value={form.hubId} onChange={handleChange("hubId")}
                options={hubs.map((h) => ({ value: h.id, label: h.name }))} placeholder="Select hub" />
              <Select label="Select Membership Plan" required value={form.planCode} onChange={handleChange("planCode")}
                options={plans.map((p) => ({ value: p.planCode, label: p.name }))} placeholder="Select plan" />
            </div>
            <div className="mt-4">
              <Input label="Joined Date" type="date" value={form.joinedAt} onChange={handleChange("joinedAt")} />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase mb-3">Certificate</p>
            <label className="block rounded-xl border-2 border-dashed border-gray-200 hover:border-green-300 hover:bg-green-50/20 px-6 py-8 text-center cursor-pointer transition-colors">
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setCertificate(e.target.files?.[0] || null)} className="hidden" />
              <UploadCloud className="h-6 w-6 text-gray-400 mx-auto mb-2" />
              <p className="font-medium text-gray-900 text-sm">{certificate ? certificate.name : "Upload Business Certificate"}</p>
              <p className="text-xs text-gray-400 mt-1">PDF or image, up to 10MB</p>
            </label>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </form>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="border border-gray-200 text-gray-600 font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-amber-400 hover:bg-green-600 hover:text-white text-gray-900 font-semibold px-5 py-2.5 rounded-xl disabled:opacity-60"
          >
            <Plus className="h-4 w-4" /> {isSubmitting ? "Adding..." : "Add Member"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Input = ({ label, required, ...props }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-900 mb-2">{label}{required && <span className="text-amber-500"> *</span>}</label>
    <input {...props} required={required} className="w-full rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 px-4 py-2.5 text-sm outline-none" />
  </div>
);

const Select = ({ label, required, options, placeholder, ...props }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-900 mb-2">{label}{required && <span className="text-amber-500"> *</span>}</label>
    <select {...props} required={required} className="w-full rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 px-4 py-2.5 text-sm outline-none bg-white">
      <option value="">{placeholder}</option>
      {options.map((opt) =>
        typeof opt === "string"
          ? <option key={opt} value={opt}>{opt}</option>
          : <option key={opt.value} value={opt.value}>{opt.label}</option>
      )}
    </select>
  </div>
);

export default AddMemberModal;
