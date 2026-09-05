import { useState } from "react";
import { Mail, Lock, MapPin, ChevronDown, ArrowRight, Eye, EyeOff } from "lucide-react";
import { HUB_OPTIONS } from "../../utils/hubs";

const LoginForm = ({ onSubmit, isLoading, errorMessage }) => {
  const [form, setForm] = useState({ email: "", password: "", hub: HUB_OPTIONS[0] });
  const [showPassword, setShowPassword] = useState(false);
  const [allowInput, setAllowInput] = useState(false);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const enableInput = () => setAllowInput(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
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
            name="vc-member-identity"
            placeholder="you@example.com"
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
            name="vc-member-secret"
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

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Hub</label>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
          <select
            value={form.hub}
            onChange={handleChange("hub")}
            className="w-full appearance-none rounded-xl border border-gray-200 hover:border-green-300 pl-11 pr-10 py-3.5 text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-colors bg-white"
          >
            {HUB_OPTIONS.map((hub) => (
              <option key={hub} value={hub}>{hub}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {errorMessage && <p className="text-sm text-red-500 text-center">{errorMessage}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="group w-full inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-gray-900 hover:text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-green-200"
      >
        {isLoading ? "Logging in..." : "Login"}
        {!isLoading && <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />}
      </button>
    </form>
  );
};

export default LoginForm;
