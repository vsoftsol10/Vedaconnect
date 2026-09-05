import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import OnboardingHeader from "../../components/onboarding/OnboardingHeader";
import OnboardingCard from "../../components/onboarding/OnboardingCard";
import { login as loginRequest } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [allowInput, setAllowInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const enableInput = () => setAllowInput(true);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    try {
      const { token, user } = await loginRequest(form);

      if (user.role !== "ADMIN") {
        setErrorMessage("This account doesn't have admin access. Use the member login instead.");
        setIsLoading(false);
        return;
      }

      login(token, user);
      navigate("/admin/dashboard");
    } catch (err) {
      setErrorMessage(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-stone-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <OnboardingHeader tagline="Admin Portal" />
        <OnboardingCard>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          </div>
          <p className="text-gray-500 mb-8">Sign in to manage VedaConnect.</p>

          <form onSubmit={handleSubmit} autoComplete="new-password" className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange("email")}
                  onFocus={enableInput}
                  onPointerDown={enableInput}
                  readOnly={!allowInput}
                  autoComplete="new-password"
                  name="vc-admin-identity"
                  placeholder="admin@vedaconnect.com"
                  className="w-full rounded-xl border border-gray-200 hover:border-green-300 pl-11 pr-4 py-3.5 text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={handleChange("password")}
                  onFocus={enableInput}
                  onPointerDown={enableInput}
                  readOnly={!allowInput}
                  autoComplete="new-password"
                  name="vc-admin-secret"
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-gray-200 hover:border-green-300 pl-11 pr-11 py-3.5 text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {errorMessage && <p className="text-sm text-red-500 text-center">{errorMessage}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="group w-full inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-green-600 disabled:opacity-60 text-gray-900 hover:text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-300"
            >
              {isLoading ? "Logging in..." : "Login to Admin Portal"}
              {!isLoading && <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />}
            </button>
          </form>
        </OnboardingCard>
      </div>
    </div>
  );
};

export default AdminLogin;
