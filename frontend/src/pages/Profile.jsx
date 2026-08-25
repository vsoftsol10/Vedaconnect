import { useEffect, useState } from "react";
import { Pencil, Mail, Phone, MapPin, Building2, Briefcase, Package, ShieldCheck, Eye, Download, X, Check } from "lucide-react";
import Sidebar from "../components/dashboard/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import { getMyFullProfile, updateMyProfile } from "../services/memberService";

const EDITABLE_FIELDS = [
  { key: "fullName", label: "Full Name" },
  { key: "phone", label: "Phone" },
  { key: "location", label: "Location" },
  { key: "businessName", label: "Business Name" },
  { key: "businessCategory", label: "Category" },
  { key: "businessLocation", label: "Business Location" },
  { key: "businessDescription", label: "Description", multiline: true },
  { key: "productsServices", label: "Products / Services", multiline: true },
];

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const load = () => getMyFullProfile().then((data) => {
    setProfile(data);
    setForm(data);
  });

  useEffect(() => { load(); }, []);

  const handleChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateMyProfile(form);
      await load();
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) return null;

  const validUntilLabel = profile.billingCycle === "LIFETIME"
    ? "Lifetime"
    : profile.joinedAt
      ? new Date(new Date(profile.joinedAt).setFullYear(new Date(profile.joinedAt).getFullYear() + 1)).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
      : "-";

  const memberSinceLabel = profile.joinedAt
    ? new Date(profile.joinedAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "-";

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Profile</h1>
          <p className="text-gray-500 mb-6">Manage your personal and business information.</p>

          {/* Banner */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-6 shadow-sm">
            <div className="h-24 bg-gradient-to-r from-green-50 to-amber-100" />
            <div className="px-6 pb-6 -mt-10 flex items-end justify-between flex-wrap gap-4">
              <div className="flex items-end gap-4">
                {profile.profilePhoto ? (
                  <img src={profile.profilePhoto} alt={profile.fullName} className="h-20 w-20 rounded-2xl object-cover border-4 border-white" />
                ) : (
                  <div className="h-20 w-20 rounded-2xl bg-amber-100 border-4 border-white flex items-center justify-center text-2xl font-bold text-amber-700">
                    {profile.fullName?.[0]}
                  </div>
                )}
                <div className="pb-1">
                  <h2 className="text-xl font-bold text-gray-900">{profile.fullName}</h2>
                  <p className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="h-3.5 w-3.5" /> {profile.location}
                  </p>
                </div>
              </div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 border border-gray-200 hover:border-green-400 hover:text-green-600 text-gray-700 font-medium px-4 py-2 rounded-xl transition-colors"
                >
                  <Pencil className="h-4 w-4" /> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => { setForm(profile); setIsEditing(false); }}
                    className="flex items-center gap-2 border border-gray-200 text-gray-500 font-medium px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <X className="h-4 w-4" /> Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-amber-400 hover:bg-green-600 hover:text-white text-gray-900 font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-60"
                  >
                    <Check className="h-4 w-4" /> {isSaving ? "Saving..." : "Save"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Details */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Personal Details</h3>
              <div className="space-y-3">
                <InfoRow icon={Pencil} label="Full Name" value={profile.fullName} editable={isEditing} field="fullName" form={form} onChange={handleChange} />
                <InfoRow icon={Mail} label="Email" value={profile.email} />
                <InfoRow icon={Phone} label="Phone" value={profile.phone} editable={isEditing} field="phone" form={form} onChange={handleChange} />
                <InfoRow icon={MapPin} label="Location" value={profile.location} editable={isEditing} field="location" form={form} onChange={handleChange} />
              </div>
            </div>

            {/* Business Information */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Business Information</h3>
              <div className="space-y-3">
                <InfoRow icon={Building2} label="Business Name" value={profile.businessName} editable={isEditing} field="businessName" form={form} onChange={handleChange} />
                <InfoRow icon={Briefcase} label="Category" value={profile.businessCategory} editable={isEditing} field="businessCategory" form={form} onChange={handleChange} />
                <InfoRow icon={MapPin} label="Location" value={profile.businessLocation} editable={isEditing} field="businessLocation" form={form} onChange={handleChange} />
                <div>
                  <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase mb-1">Description</p>
                  {isEditing ? (
                    <textarea value={form.businessDescription || ""} onChange={handleChange("businessDescription")} rows={3}
                      className="w-full rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 p-3 text-sm outline-none" />
                  ) : (
                    <p className="text-gray-700 text-sm leading-relaxed">{profile.businessDescription}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Products / Services */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="flex items-center gap-2 font-bold text-gray-900 mb-4">
                <Package className="h-5 w-5 text-green-600" /> Products / Services
              </h3>
              {isEditing ? (
                <textarea value={form.productsServices || ""} onChange={handleChange("productsServices")} rows={3}
                  className="w-full rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 p-3 text-sm outline-none" />
              ) : (
                <p className="text-gray-700 text-sm leading-relaxed">{profile.productsServices || "Not added yet."}</p>
              )}
            </div>

            {/* Membership */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="flex items-center gap-2 font-bold text-gray-900 mb-4">
                <ShieldCheck className="h-5 w-5 text-green-600" /> Membership
              </h3>
              <div className="bg-green-50 rounded-xl px-4 py-3 flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase">Plan</p>
                  <p className="font-bold text-gray-900">{profile.membershipType?.replace("_", " ")}</p>
                </div>
                <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> {profile.membershipStatus}
                </span>
              </div>
              <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between mb-3">
                <span className="text-xs text-gray-400 uppercase">Valid Until</span>
                <span className="font-semibold text-gray-900">{validUntilLabel}</span>
              </div>
              <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-xs text-gray-400 uppercase">Member Since</span>
                <span className="font-semibold text-gray-900">{memberSinceLabel}</span>
              </div>
            </div>
          </div>

          {/* Business Certificate */}
          {profile.certificates?.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mt-6">
              <h3 className="font-bold text-gray-900 mb-4">Business Certificate</h3>
              {profile.certificates.map((cert) => (
                <div key={cert.id} className="bg-gray-50 rounded-xl p-4 flex items-center gap-3 mb-3">
                  <span className="h-10 w-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                    <Package className="h-5 w-5 text-gray-400" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">{cert.fileName}</p>
                    <p className="text-xs text-gray-400">Uploaded during onboarding</p>
                  </div>
                </div>
              ))}
              <div className="flex gap-3">
                <a href={profile.certificates[0]?.signedUrl} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 border border-gray-200 hover:border-green-400 rounded-xl py-2.5 font-medium text-gray-700 transition-colors">
                  <Eye className="h-4 w-4" /> View
                </a>
                <a href={profile.certificates[0]?.signedUrl} download
                  className="flex-1 flex items-center justify-center gap-2 border border-gray-200 hover:border-green-400 rounded-xl py-2.5 font-medium text-gray-700 transition-colors">
                  <Download className="h-4 w-4" /> Download
                </a>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value, editable, field, form, onChange }) => (
  <div className="flex items-start gap-3">
    <span className="h-9 w-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon className="h-4 w-4 text-gray-400" />
    </span>
    <div className="flex-1">
      <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase mb-0.5">{label}</p>
      {editable ? (
        <input value={form[field] || ""} onChange={onChange(field)}
          className="w-full rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 px-2 py-1 text-sm outline-none" />
      ) : (
        <p className="font-semibold text-gray-900">{value}</p>
      )}
    </div>
  </div>
);

export default Profile;