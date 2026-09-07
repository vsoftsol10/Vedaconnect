import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Mail, Shield, KeyRound, LogOut, X, Eye, EyeOff } from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import { useAuth } from "../../context/AuthContext";
import { getAdminProfile, updateAdminProfile, changeAdminPassword } from "../../services/adminService";

const AdminProfile = () => {
  const navigate = useNavigate();
  const { logout, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const load = () => getAdminProfile().then(setProfile);
  useEffect(() => { load(); }, []);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  if (!profile) return null;

  return (
    <div className="flex min-h-screen bg-stone-50">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <AdminHeader title="Profile" />
        <main className="max-w-3xl px-4 py-6 sm:px-6 md:p-8">
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-6 shadow-sm">
            <div className="h-24 bg-gradient-to-r from-amber-100 to-green-50" />
            <div className="px-6 pb-6 -mt-10 flex items-end justify-between flex-wrap gap-4">
              <div className="flex items-end gap-4">
                <div className="h-20 w-20 rounded-2xl bg-amber-100 border-4 border-white flex items-center justify-center text-2xl font-bold text-amber-700">
                  {profile.fullName?.[0] || profile.email[0].toUpperCase()}
                </div>
                <div className="pb-1">
                  <h1 className="text-xl font-bold text-gray-900">{profile.fullName || "Admin"}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-amber-50 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full">Super Admin</span>
                    <span className="flex items-center gap-1 text-xs text-gray-400"><Mail className="h-3 w-3" /> {profile.email}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowEditModal(true)} className="flex items-center gap-2 border border-gray-200 hover:border-green-400 text-gray-700 font-medium px-4 py-2 rounded-xl transition-colors">
                <Pencil className="h-4 w-4" /> Edit Profile
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Full Name</p>
                <p className="font-medium text-gray-900">{profile.fullName || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Email</p>
                <p className="font-medium text-gray-900">{profile.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Role</p>
                <span className="bg-amber-50 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full">Super Admin</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-6">
            <h3 className="flex items-center gap-2 font-bold text-gray-900 mb-4"><Shield className="h-5 w-5 text-green-600" /> Security</h3>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-xl px-4 py-3 transition-colors"
            >
              <div className="flex items-center gap-3">
                <KeyRound className="h-4 w-4 text-gray-400" />
                <div className="text-left">
                  <p className="font-medium text-gray-900 text-sm">Change Password</p>
                  <p className="text-xs text-gray-400">Update your account password</p>
                </div>
              </div>
            </button>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Account</h3>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 bg-red-50 hover:bg-red-100 rounded-xl px-4 py-3 text-left transition-colors"
            >
              <LogOut className="h-4 w-4 text-red-500" />
              <div>
                <p className="font-medium text-red-600 text-sm">Logout</p>
                <p className="text-xs text-red-400">Sign out of your admin account</p>
              </div>
            </button>
          </div>
        </main>
      </div>

      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onSaved={(updatedProfile) => {
            setProfile(updatedProfile);
            updateUser(updatedProfile);
            setShowEditModal(false);
          }}
        />
      )}
      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
};

const EditProfileModal = ({ profile, onClose, onSaved }) => {
  const [form, setForm] = useState({ fullName: profile.fullName || "", email: profile.email });
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [preview, setPreview] = useState(profile.profilePhoto || "");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfilePhotoFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);
    try {
      const updatedProfile = await updateAdminProfile(form, profilePhotoFile);
      onSaved(updatedProfile);
    } catch (err) {
      setError(err.message || "Could not save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4">
      <div className="max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white sm:max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Edit Profile</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex items-center gap-4">
            {preview ? (
              <img src={preview} alt={form.fullName || form.email} className="h-16 w-16 rounded-2xl object-cover border border-gray-100" />
            ) : (
              <div className="h-16 w-16 rounded-2xl bg-amber-100 flex items-center justify-center text-xl font-bold text-amber-700">
                {(form.fullName || form.email)?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <div>
              <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-green-400">
                Upload Photo
                <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handlePhotoChange} className="sr-only" />
              </label>
              <p className="mt-1 text-xs text-gray-400">JPG, PNG, or WebP under 2MB.</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
            <input required value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 focus:border-green-500 px-4 py-3 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
            <input required type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 focus:border-green-500 px-4 py-3 outline-none" />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="border border-gray-200 text-gray-600 font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isSaving} className="bg-amber-400 hover:bg-green-600 hover:text-white text-gray-900 font-semibold px-5 py-2.5 rounded-xl disabled:opacity-60">
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ChangePasswordModal = ({ onClose }) => {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [visible, setVisible] = useState({ currentPassword: false, newPassword: false, confirmPassword: false });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords don't match.");
      return;
    }
    setIsSaving(true);
    try {
      await changeAdminPassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setSuccess(true);
      setTimeout(onClose, 1200);
    } catch (err) {
      setError(err.message || "Could not update password.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4">
      <div className="max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white sm:max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <PasswordField
            label="Current Password"
            value={form.currentPassword}
            isVisible={visible.currentPassword}
            onChange={(value) => setForm((p) => ({ ...p, currentPassword: value }))}
            onToggle={() => setVisible((p) => ({ ...p, currentPassword: !p.currentPassword }))}
          />
          <PasswordField
            label="New Password"
            value={form.newPassword}
            isVisible={visible.newPassword}
            onChange={(value) => setForm((p) => ({ ...p, newPassword: value }))}
            onToggle={() => setVisible((p) => ({ ...p, newPassword: !p.newPassword }))}
          />
          <PasswordField
            label="Confirm New Password"
            value={form.confirmPassword}
            isVisible={visible.confirmPassword}
            onChange={(value) => setForm((p) => ({ ...p, confirmPassword: value }))}
            onToggle={() => setVisible((p) => ({ ...p, confirmPassword: !p.confirmPassword }))}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-600">Password updated successfully.</p>}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="border border-gray-200 text-gray-600 font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isSaving} className="flex items-center gap-2 bg-amber-400 hover:bg-green-600 hover:text-white text-gray-900 font-semibold px-5 py-2.5 rounded-xl disabled:opacity-60">
              {isSaving ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PasswordField = ({ label, value, isVisible, onChange, onToggle }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-900 mb-2">{label}</label>
    <div className="relative">
      <input
        required
        type={isVisible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-200 focus:border-green-500 px-4 py-3 pr-11 outline-none"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600"
        aria-label={isVisible ? `Hide ${label}` : `Show ${label}`}
      >
        {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  </div>
);

export default AdminProfile;
