import { useEffect, useState } from "react";
import { Handshake, Loader2, Plus, ReceiptIndianRupee } from "lucide-react";
import Sidebar from "../components/dashboard/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import { listMembers } from "../services/memberService";
import {
  getMyBusinessReceived,
  getMyReferrals,
  logBusinessReceived,
  logReferral,
} from "../services/networkingService";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    Number(amount || 0)
  );

const emptyForm = {
  partyType: "member",
  memberId: "",
  externalName: "",
  externalBusiness: "",
  externalContact: "",
  amount: "",
  description: "",
};

const EntryForm = ({ members, activeTab, form, setForm, isSaving, onSubmit }) => {
  const isReferral = activeTab === "referrals";

  return (
    <form onSubmit={onSubmit} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        {isReferral ? (
          <Handshake className="h-5 w-5 text-green-600" />
        ) : (
          <ReceiptIndianRupee className="h-5 w-5 text-green-600" />
        )}
        <h2 className="font-bold text-gray-900">
          {isReferral ? "Log Referral Given" : "Log Business Received"}
        </h2>
      </div>

      <div className="space-y-4">
        <div className="flex rounded-xl bg-stone-50 border border-gray-100 p-1">
          {[
            ["member", "Member"],
            ["external", "Non-member / External"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  partyType: key,
                  memberId: "",
                  externalName: "",
                  externalBusiness: "",
                  externalContact: "",
                }))
              }
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                form.partyType === key ? "bg-amber-400 text-gray-900" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {form.partyType === "member" ? (
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {isReferral ? "Referral Receiver" : "Referrer"}
            </label>
            <select
              value={form.memberId}
              onChange={(event) => setForm((current) => ({ ...current, memberId: event.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              required
            >
              <option value="">Select member</option>
              {members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.fullName} {member.businessName ? `- ${member.businessName}` : ""}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Name</label>
              <input
                type="text"
                value={form.externalName}
                onChange={(event) => setForm((current) => ({ ...current, externalName: event.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                placeholder="Contact name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Business / category</label>
              <input
                type="text"
                value={form.externalBusiness}
                onChange={(event) => setForm((current) => ({ ...current, externalBusiness: event.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                placeholder="Business or category"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Phone / note</label>
              <input
                type="text"
                value={form.externalContact}
                onChange={(event) => setForm((current) => ({ ...current, externalContact: event.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                placeholder="Phone number or short note"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Amount
          </label>
          <input
            type="number"
            min="1"
            step="1"
            value={form.amount}
            onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            placeholder="18000"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
          <textarea
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            className="min-h-28 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            placeholder="Short note"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-green-600 hover:text-white disabled:opacity-60"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Save Entry
        </button>
      </div>
    </form>
  );
};

const EntryList = ({ title, items, type }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
    <h2 className="font-bold text-gray-900 mb-4">{title}</h2>
    <div className="space-y-3">
      {items.length ? (
        items.map((item) => {
          const person = type === "referral" ? item.receiver : item.referrer;
          return (
            <div key={item.id} className="flex items-start justify-between gap-4 border-b border-gray-50 pb-3 last:border-0">
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">{person?.fullName || "External contact"}</p>
                <p className="text-sm text-gray-500 truncate">{person?.businessName || person?.contact || item.description || "-"}</p>
                {item.description && <p className="text-xs text-gray-400 mt-1">{item.description}</p>}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-green-700">{formatCurrency(item.amount)}</p>
                <p className="text-[11px] text-gray-400">{new Date(item.createdAt).toLocaleDateString("en-IN")}</p>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-sm text-gray-400">No entries yet.</p>
      )}
    </div>
  </div>
);

const Networking = () => {
  const [activeTab, setActiveTab] = useState("referrals");
  const [members, setMembers] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [business, setBusiness] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    const [memberRows, referralRows, businessRows] = await Promise.all([
      listMembers(),
      getMyReferrals(),
      getMyBusinessReceived(),
    ]);
    setMembers(memberRows);
    setReferrals(referralRows);
    setBusiness(businessRows);
  };

  useEffect(() => {
    load()
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      if (activeTab === "referrals") {
        await logReferral({
          receiverType: form.partyType,
          receiverId: form.partyType === "member" ? form.memberId : null,
          externalName: form.externalName,
          externalBusiness: form.externalBusiness,
          externalContact: form.externalContact,
          amount: Number(form.amount),
          description: form.description,
        });
      } else {
        await logBusinessReceived({
          referrerType: form.partyType,
          referrerId: form.partyType === "member" ? form.memberId : null,
          externalName: form.externalName,
          externalBusiness: form.externalBusiness,
          externalContact: form.externalContact,
          amount: Number(form.amount),
          description: form.description,
        });
      }
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    ["referrals", "Referrals Given"],
    ["business", "Business Received"],
  ];

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Networking</h1>
              <p className="text-gray-500 mt-1">Track referrals and business shared across the community.</p>
            </div>
            <div className="flex rounded-xl bg-white border border-gray-100 p-1">
              {tabs.map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setActiveTab(key);
                    setForm(emptyForm);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    activeTab === key ? "bg-amber-400 text-gray-900" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">{error}</div>}

          {isLoading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading networking
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
              <EntryForm
                members={members}
                activeTab={activeTab}
                form={form}
                setForm={setForm}
                isSaving={isSaving}
                onSubmit={handleSubmit}
              />
              {activeTab === "referrals" ? (
                <EntryList title="Your Referrals Given" items={referrals} type="referral" />
              ) : (
                <EntryList title="Your Business Received" items={business} type="business" />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Networking;
