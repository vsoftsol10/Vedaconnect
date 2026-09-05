import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, User, Mail, Phone, MapPin } from "lucide-react";
import OnboardingHeader from "../../components/onboarding/OnboardingHeader";
import OnboardingProgress from "../../components/onboarding/OnboardingProgress";
import OnboardingCard from "../../components/onboarding/OnboardingCard";
import { useOnboarding } from "../../context/OnboardingContext";
import { submitPersonalDetails } from "../../services/onboardingService";

const PHONE_ERROR = "Enter a valid 10-digit phone number";
const normalizePhone = (value) => {
  const digits = value.replace(/\D/g, "");
  return digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
};

const PersonalDetails = () => {
  const navigate = useNavigate();
  const { setUserId } = useOnboarding();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
    if (submitError) setSubmitError("");
  };

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required";
    if (!form.email.trim()) next.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email";
    if (!form.phone.trim()) next.phone = "Phone number is required";
    else if (normalizePhone(form.phone).length !== 10) next.phone = PHONE_ERROR;
    if (!form.location.trim()) next.location = "Location is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleContinue = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError("");
    try {
      const result = await submitPersonalDetails(form);
      setUserId(result.userId);
      navigate("/onboarding/business-details");
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-stone-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <OnboardingHeader />
        <OnboardingProgress currentStep={1} />

        <OnboardingCard>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <h1 className="text-2xl font-bold text-gray-900">Personal Details</h1>
          </div>
          <p className="text-gray-500 mb-8">
            Tell us a bit about yourself to get started.
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <input
                  type="text"
                  value={form.fullName}
                  onChange={handleChange("fullName")}
                  placeholder="Enter your full name"
                  className={`w-full rounded-xl border pl-11 pr-4 py-3.5 text-gray-900 placeholder-gray-400 outline-none transition-colors ${
                    errors.fullName
                      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  }`}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1.5 text-xs text-red-500">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  placeholder="you@example.com"
                  className={`w-full rounded-xl border pl-11 pr-4 py-3.5 text-gray-900 placeholder-gray-400 outline-none transition-colors ${
                    errors.email
                      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={handleChange("phone")}
                    placeholder="+91 00000 00000"
                    className={`w-full rounded-xl border pl-11 pr-4 py-3.5 text-gray-900 placeholder-gray-400 outline-none transition-colors ${
                      errors.phone
                        ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-gray-200 hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <input
                    type="text"
                    value={form.location}
                    onChange={handleChange("location")}
                    placeholder="City"
                    className={`w-full rounded-xl border pl-11 pr-4 py-3.5 text-gray-900 placeholder-gray-400 outline-none transition-colors ${
                      errors.location
                        ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-gray-200 hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    }`}
                  />
                </div>
                {errors.location && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.location}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-9">
            {submitError && (
              <p className="mr-4 self-center text-sm text-red-500">{submitError}</p>
            )}
            <button
              type="button"
              onClick={handleContinue}
              disabled={isSubmitting}
              className="group inline-flex items-center gap-2 bg-amber-400 hover:bg-green-600 text-gray-900 hover:text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-green-200 ring-2 ring-transparent hover:ring-green-100"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>
        </OnboardingCard>

        <p className="text-center text-xs text-gray-400 mt-6">
          Your details are used only to set up your VedaConnect membership account.
        </p>
      </div>
    </div>
  );
};

export default PersonalDetails;
