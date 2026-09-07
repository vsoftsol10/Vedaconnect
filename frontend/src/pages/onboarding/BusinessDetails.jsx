import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Building2, MapPin, ChevronDown, FileText, Loader2 } from "lucide-react";
import OnboardingHeader from "../../components/onboarding/OnboardingHeader";
import OnboardingProgress from "../../components/onboarding/OnboardingProgress";
import OnboardingCard from "../../components/onboarding/OnboardingCard";
import { useOnboarding } from "../../context/OnboardingContext";
import { submitBusinessDetails } from "../../services/onboardingService";

const BUSINESS_CATEGORIES = [
  "Herbal & Wellness",
  "Natural Products",
  "Food & Beverage",
  "Handicrafts",
  "Fashion & Textiles",
  "Beauty & Personal Care",
  "Other",
];

const BusinessDetails = () => {
  const navigate = useNavigate();
  const { userId } = useOnboarding();
  const [form, setForm] = useState({
    businessName: "",
    businessCategory: BUSINESS_CATEGORIES[0],
    businessLocation: "",
    businessDescription: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!userId) navigate("/onboarding/personal-details", { replace: true });
  }, [navigate, userId]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (submitError) setSubmitError("");
  };

  const handleContinue = async () => {
    if (!userId) {
      setSubmitError("Member profile not found. Complete Step 1 first.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    try {
      await submitBusinessDetails({ userId, ...form });
      navigate("/onboarding/business-certificate");
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => navigate("/onboarding/personal-details");

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-stone-50 px-4 py-6 sm:py-12">
      <div className="w-full max-w-2xl">
        <OnboardingHeader />
        <OnboardingProgress currentStep={2} />

        <OnboardingCard>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <h1 className="text-2xl font-bold text-gray-900">Business Details</h1>
          </div>
          <p className="text-gray-500 mb-8">Help the community know your business.</p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Business Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <input
                  type="text"
                  value={form.businessName}
                  onChange={handleChange("businessName")}
                  placeholder="Enter your business name"
                  className="w-full rounded-xl border border-gray-200 hover:border-green-300 pl-11 pr-4 py-3.5 text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Business Category
                </label>
                <div className="relative">
                  <select
                    value={form.businessCategory}
                    onChange={handleChange("businessCategory")}
                    className="w-full appearance-none rounded-xl border border-gray-200 hover:border-green-300 pl-4 pr-10 py-3.5 text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-colors bg-white"
                  >
                    {BUSINESS_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Business Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <input
                    type="text"
                    value={form.businessLocation}
                    onChange={handleChange("businessLocation")}
                    placeholder="City, State"
                    className="w-full rounded-xl border border-gray-200 hover:border-green-300 pl-11 pr-4 py-3.5 text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Business Description
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 h-4 w-4 text-gray-300" />
                <textarea
                  value={form.businessDescription}
                  onChange={handleChange("businessDescription")}
                  rows={4}
                  placeholder="Tell the community what your business does"
                  className="w-full rounded-xl border border-gray-200 hover:border-green-300 pl-11 pr-4 py-3.5 text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-9 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="group inline-flex min-h-11 items-center justify-center gap-2 text-gray-500 hover:text-green-600 font-semibold px-2 py-3.5 rounded-xl transition-colors duration-300 sm:justify-start"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              Back
            </button>

            <button
              type="button"
              onClick={handleContinue}
              disabled={isSubmitting}
              className="group inline-flex min-h-11 w-full items-center justify-center gap-2 bg-amber-400 hover:bg-green-600 text-gray-900 hover:text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-green-200 ring-2 ring-transparent hover:ring-green-100 sm:w-auto"
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
          {submitError && <p className="mt-4 text-sm text-red-500 sm:text-right">{submitError}</p>}
        </OnboardingCard>

        <p className="text-center text-xs text-gray-400 mt-6">
          Your details are used only to set up your VedaConnect membership account.
        </p>
      </div>
    </div>
  );
};

export default BusinessDetails;
