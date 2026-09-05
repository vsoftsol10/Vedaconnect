import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import { listSubscriptions, createSubscription, updateSubscription } from "../../services/adminService";

const DURATIONS = ["12 Months", "24 Months", "LIFETIME"];

const AdminSubscriptionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id && id !== "new";

  const [form, setForm] = useState({
    name: "", basePrice: "", gstPercent: 18, billingCycle: "12 Months", description: "", isActive: true,
    activeFrom: "", activeUntil: "",
  });
  const [benefits, setBenefits] = useState([""]);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      listSubscriptions().then((plans) => {
        const plan = plans.find((p) => p.id === id);
        if (plan) {
          setForm({
            name: plan.name,
            basePrice: Number(plan.baseAmount ?? plan.amount),
            gstPercent: Number(plan.gstPercent ?? 18),
            billingCycle: plan.billingCycle,
            description: plan.description || "",
            isActive: plan.isActive,
            activeFrom: plan.activeFrom ? plan.activeFrom.slice(0, 10) : "",
            activeUntil: plan.activeUntil ? plan.activeUntil.slice(0, 10) : "",
          });
          setBenefits(plan.benefits.length ? plan.benefits : [""]);
        }
      });
    }
  }, [id, isEdit]);

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  const basePrice = Number(form.basePrice || 0);
  const gstPercent = Number(form.gstPercent || 0);
  const gstAmount = Number((basePrice * gstPercent / 100).toFixed(2));
  const totalAmount = Number((basePrice + gstAmount).toFixed(2));

  const updateBenefit = (i, value) => setBenefits((prev) => prev.map((b, idx) => (idx === i ? value : b)));
  const addBenefit = () => setBenefits((prev) => [...prev, ""]);
  const removeBenefit = (i) => setBenefits((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);
    try {
      const payload = {
        name: form.name,
        basePrice,
        gstPercent,
        price: totalAmount,
        billingCycle: form.billingCycle,
        description: form.description,
        isActive: form.isActive === true || form.isActive === "Active",
        benefits: benefits.map((b) => b.trim()).filter(Boolean),
        activeFrom: form.activeFrom ? new Date(form.activeFrom).toISOString() : null,
        activeUntil: form.activeUntil ? new Date(form.activeUntil).toISOString() : null,
      };
      if (isEdit) await updateSubscription(id, payload);
      else await createSubscription(payload);
      navigate("/admin/subscriptions");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save subscription.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-stone-50">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader title="Edit Subscription" />
        <main className="p-8 max-w-2xl">
          <button onClick={() => navigate("/admin/subscriptions")} className="flex items-center gap-2 text-gray-500 hover:text-green-600 font-medium mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Subscriptions
          </button>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">{isEdit ? "Edit Subscription" : "Add Subscription"}</h1>
          <p className="text-gray-500 mb-6">Update plan details and benefits.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Subscription Name *</label>
                <input required value={form.name} onChange={handleChange("name")}
                  className="w-full rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 px-4 py-3 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Base Price *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                    <input required type="number" min="0" value={form.basePrice} onChange={handleChange("basePrice")}
                      className="w-full rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 pl-8 pr-4 py-3 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">GST % *</label>
                  <input required type="number" min="0" max="100" value={form.gstPercent} onChange={handleChange("gstPercent")}
                    className="w-full rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 px-4 py-3 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 rounded-xl bg-green-50 px-4 py-3">
                <div>
                  <p className="text-xs text-green-700">Base</p>
                  <p className="font-bold text-gray-900">₹{basePrice.toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-xs text-green-700">GST</p>
                  <p className="font-bold text-gray-900">₹{gstAmount.toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-xs text-green-700">Member Pays</p>
                  <p className="font-bold text-gray-900">₹{totalAmount.toLocaleString("en-IN")}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Duration *</label>
                <select value={form.billingCycle} onChange={handleChange("billingCycle")}
                  className="w-full rounded-xl border border-gray-200 focus:border-green-500 px-4 py-3 outline-none bg-white">
                  {DURATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                <textarea rows={3} value={form.description} onChange={handleChange("description")}
                  className="w-full rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 p-3 outline-none resize-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Status</label>
                <select value={form.isActive ? "Active" : "Inactive"} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.value === "Active" }))}
                  className="w-full rounded-xl border border-gray-200 focus:border-green-500 px-4 py-3 outline-none bg-white">
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Active From (optional)</label>
                  <input type="date" value={form.activeFrom} onChange={handleChange("activeFrom")}
                    className="w-full rounded-xl border border-gray-200 focus:border-green-500 px-4 py-3 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Active Until (optional)</label>
                  <input type="date" value={form.activeUntil} onChange={handleChange("activeUntil")}
                    className="w-full rounded-xl border border-gray-200 focus:border-green-500 px-4 py-3 outline-none" />
                </div>
              </div>
              <p className="text-xs text-gray-400 -mt-2">Leave both blank for a plan with no scheduled switch. If set, this plan only shows to new members during this window, automatically.</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Benefits</h3>
                <button type="button" onClick={addBenefit} className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-green-600">
                  <Plus className="h-4 w-4" /> Add Benefit
                </button>
              </div>
              <div className="space-y-3">
                {benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input value={b} onChange={(e) => updateBenefit(i, e.target.value)} placeholder="e.g. Priority Event Access"
                      className="flex-1 rounded-xl border border-gray-200 focus:border-green-500 px-4 py-2.5 outline-none" />
                    <button type="button" onClick={() => removeBenefit(i)} className="text-gray-400 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Preview</p>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-900">{form.name || "Subscription Name"}</p>
                  <p className="text-xs text-gray-400">{form.billingCycle}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-extrabold text-gray-900">₹{totalAmount.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-gray-400">Base ₹{basePrice.toLocaleString("en-IN")} + GST ₹{gstAmount.toLocaleString("en-IN")}</p>
                  <span className={`text-xs font-medium ${form.isActive === true || form.isActive === "Active" ? "text-green-600" : "text-red-500"}`}>
                    {form.isActive === true || form.isActive === "Active" ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <ul className="space-y-1">
                {benefits.filter(Boolean).map((b, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="h-4 w-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px]">✓</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => navigate("/admin/subscriptions")} className="border border-gray-200 text-gray-600 font-medium px-6 py-3 rounded-xl hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={isSaving} className="bg-amber-400 hover:bg-green-600 hover:text-white text-gray-900 font-semibold px-6 py-3 rounded-xl disabled:opacity-60">
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default AdminSubscriptionForm;
