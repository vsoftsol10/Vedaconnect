import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Power, Plus } from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import { listSubscriptions, toggleSubscription } from "../../services/adminService";

const AdminSubscriptions = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);

  const load = () => listSubscriptions().then(setPlans);
  useEffect(() => { load(); }, []);

  const handleToggle = async (id) => {
    await toggleSubscription(id);
    load();
  };

  return (
    <div className="flex min-h-screen bg-stone-50">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <AdminHeader title="Subscriptions" />
        <main className="px-4 py-6 sm:px-6 md:p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Subscriptions</h2>
              <p className="text-gray-500">Manage membership plans available to members.</p>
            </div>
            <button
              onClick={() => navigate("/admin/subscriptions/new")}
              className="flex items-center gap-2 bg-amber-400 hover:bg-green-600 hover:text-white text-gray-900 font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              <Plus className="h-4 w-4" /> Add Subscription
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((plan) => (
              <div key={plan.id} className="flex flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-bold text-gray-900">{plan.name}</h3>
                  <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${plan.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${plan.isActive ? "bg-green-500" : "bg-red-500"}`} />
                    {plan.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-4">{plan.billingCycle}</p>
                <p className="text-3xl font-extrabold text-gray-900 mb-1">
                  ₹{Number(plan.amount).toLocaleString("en-IN")}
                  <span className="text-sm font-normal text-gray-400"> / Plan</span>
                </p>
                <p className="text-xs text-gray-500 mb-1">
                  Base ₹{Number(plan.baseAmount || 0).toLocaleString("en-IN")} + GST {Number(plan.gstPercent || 0)}%
                </p>
                <p className="text-xs text-gray-400 mb-4">{plan.billingCycle}</p>
                <p className="text-sm text-gray-600 mb-4 flex-1">{plan.description}</p>

                {(plan.activeFrom || plan.activeUntil) && (
                  <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-4">
                    {plan.activeFrom && `From ${new Date(plan.activeFrom).toLocaleDateString("en-IN")}`}
                    {plan.activeFrom && plan.activeUntil && " · "}
                    {plan.activeUntil && `Until ${new Date(plan.activeUntil).toLocaleDateString("en-IN")}`}
                  </p>
                )}

                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Benefits</p>
                <ul className="space-y-1.5 mb-6">
                  {plan.benefits.map((b, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="h-4 w-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px]">✓</span>
                      {b}
                    </li>
                  ))}
                </ul>

                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => navigate(`/admin/subscriptions/${plan.id}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 hover:border-green-400 text-gray-700 text-sm font-medium py-2 rounded-xl transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleToggle(plan.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-medium py-2 rounded-xl transition-colors ${
                      plan.isActive ? "border border-red-200 text-red-600 hover:bg-red-50" : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    <Power className="h-3.5 w-3.5" /> {plan.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSubscriptions;
