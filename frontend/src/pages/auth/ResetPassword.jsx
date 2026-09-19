import { useState } from "react";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import OnboardingHeader from "../../components/onboarding/OnboardingHeader";
import OnboardingCard from "../../components/onboarding/OnboardingCard";
import { resetPassword } from "../../services/authService";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (password !== confirm) {
      setSuccess(false);
      return setMessage("Passwords do not match.");
    }

    setLoading(true);
    setMessage("");
    try {
      const result = await resetPassword({ token: params.get("token"), newPassword: password });
      setSuccess(true);
      setMessage(result.message || "Your password has been reset. Redirecting to login...");
      window.setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: { successMessage: "Your password has been reset. Please log in with your new password." },
        });
      }, 2000);
    } catch (error) {
      setSuccess(false);
      setMessage(error.message || "Could not reset password.");
    } finally {
      setLoading(false);
    }
  };

  const passwordField = (id, value, onChange, visible, toggle, placeholder) => (
    <div className="relative">
      <label className="sr-only" htmlFor={id}>{placeholder}</label>
      <input id={id} type={visible ? "text" : "password"} required minLength="6" value={value} onChange={onChange} placeholder={placeholder} className="min-h-11 w-full rounded-xl border border-gray-200 px-4 py-3.5 pr-11 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100" />
      <button type="button" onClick={toggle} aria-label={visible ? `Hide ${placeholder.toLowerCase()}` : `Show ${placeholder.toLowerCase()}`} className="absolute right-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl text-gray-400 hover:text-green-600">
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );

  return <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4"><div className="w-full max-w-md"><OnboardingHeader /><OnboardingCard><h1 className="text-2xl font-bold text-gray-900">Set a New Password</h1><p className="mb-6 mt-1 text-gray-500">Choose a new password with at least six characters.</p><form onSubmit={submit} className="space-y-4">{passwordField("new-password", password, (event) => setPassword(event.target.value), showPassword, () => setShowPassword((value) => !value), "New password")}{passwordField("confirm-password", confirm, (event) => setConfirm(event.target.value), showConfirm, () => setShowConfirm((value) => !value), "Confirm new password")}<button disabled={loading || success || !params.get("token")} className="min-h-11 w-full rounded-xl bg-amber-400 py-3.5 font-semibold text-gray-900 disabled:opacity-60">{loading ? "Resetting..." : success ? "Redirecting to login..." : "Reset Password"}</button></form>{message && <div role="alert" className={`mt-4 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${success ? "border-green-100 bg-green-50 text-green-700" : "border-red-100 bg-red-50 text-red-600"}`}>{success && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}{message}</div>}<Link to="/login" className="mt-5 inline-flex min-h-11 items-center text-sm font-medium text-green-700">Back to login</Link></OnboardingCard></div></div>;
}
