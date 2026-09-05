import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react";
import OnboardingHeader from "../../components/onboarding/OnboardingHeader";
import OnboardingProgress from "../../components/onboarding/OnboardingProgress";
import OnboardingCard from "../../components/onboarding/OnboardingCard";
import { useOnboarding } from "../../context/OnboardingContext";
import { getMembershipPlans, submitMembershipSelection } from "../../services/onboardingService";

const formatCurrency = (amount) => new Intl.NumberFormat("en-IN").format(Number(amount || 0));
const formatBillingCycle = (billingCycle) => {
  if (!billingCycle) return "";
  if (/^12\s*months?$/i.test(billingCycle)) return "1 Year";
  return billingCycle.toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase());
};

const getPriceBreakdown = (plan) => {
  const baseAmount = Number(plan?.baseAmount || 0);
  const gstPercent = Number(plan?.gstPercent || 0);
  const totalAmount = Number(plan?.amount || 0);
  const gstAmount = totalAmount - baseAmount;

  return { baseAmount, gstPercent, gstAmount, totalAmount };
};

const MembershipPlan = () => {
  const navigate = useNavigate();
  const { userId } = useOnboarding();
  const [plans, setPlans] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) {
      navigate("/onboarding/personal-details", { replace: true });
      return;
    }

    const loadPlans = async () => {
      setIsLoadingPlans(true);
      setError("");
      try {
        const result = await getMembershipPlans();
        setPlans(result || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoadingPlans(false);
      }
    };

    loadPlans();
  }, [navigate, userId]);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.planCode === "FOUNDING_MEMBER") || plans[0],
    [plans]
  );
  const price = getPriceBreakdown(selectedPlan);
  const billingCycle = formatBillingCycle(selectedPlan?.billingCycle);

  const handleContinue = async () => {
    if (!userId || !selectedPlan) return;

    setIsSubmitting(true);
    setError("");
    try {
      await submitMembershipSelection({ userId, planCode: selectedPlan.planCode });
      navigate("/onboarding/complete-membership");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleBack = () => navigate("/onboarding/business-certificate");

  return (
    <div className="min-h-screen w-full bg-stone-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <OnboardingHeader />
        <OnboardingProgress currentStep={4} />

        <OnboardingCard>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <h1 className="text-2xl font-bold text-gray-900">Membership Plan</h1>
          </div>
          <p className="text-gray-500 mb-8">Your membership details and benefits.</p>

          {isLoadingPlans ? (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-10 flex items-center justify-center text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading plan
            </div>
          ) : selectedPlan ? (
            <div className="rounded-2xl border-2 border-amber-400 bg-amber-50/60 p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <span className="h-7 w-7 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
                    <Check className="h-4 w-4 text-gray-900" strokeWidth={3} />
                  </span>
                  <h2 className="text-lg font-bold text-gray-900">{selectedPlan.name}</h2>
                  {selectedPlan.badge && (
                    <span className="text-[11px] font-bold tracking-wide bg-green-600 text-white px-2.5 py-1 rounded-full">
                      {selectedPlan.badge}
                    </span>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-extrabold text-gray-900 leading-tight">
                    &#8377;{formatCurrency(price.totalAmount)}
                  </p>
                  <p className="text-sm text-gray-500">{billingCycle}</p>
                </div>
              </div>

              <div className="rounded-xl bg-white/80 border border-amber-100 px-5 py-4 mb-5 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Base Amount</span>
                  <span className="font-semibold text-gray-900">&#8377;{formatCurrency(price.baseAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">GST ({formatCurrency(price.gstPercent)}%)</span>
                  <span className="font-semibold text-gray-900">&#8377;{formatCurrency(price.gstAmount)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-amber-100 pt-2">
                  <span className="font-bold text-gray-900">Total Amount</span>
                  <span className="text-lg font-extrabold text-green-700">
                    &#8377;{formatCurrency(price.totalAmount)}
                  </span>
                </div>
              </div>

              <ul className="space-y-2.5">
                {(selectedPlan.benefits || []).map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2.5 text-gray-600">
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
              No active membership plans are available.
            </div>
          )}
          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

          <div className="flex items-center justify-between mt-9">
            <button
              type="button"
              onClick={handleBack}
              className="group inline-flex items-center gap-2 text-gray-500 hover:text-green-600 font-semibold px-2 py-3.5 rounded-xl transition-colors duration-300"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              Back
            </button>

            <button
              type="button"
              onClick={handleContinue}
              disabled={!selectedPlan || isSubmitting || isLoadingPlans}
              className="group inline-flex items-center gap-2 bg-amber-400 hover:bg-green-600 text-gray-900 hover:text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-green-200 ring-2 ring-transparent hover:ring-green-100"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : (
                <>
                  Continue to Payment
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

export default MembershipPlan;
