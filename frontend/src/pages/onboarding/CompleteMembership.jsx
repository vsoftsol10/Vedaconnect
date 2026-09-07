import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, MessageCircle, Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";
import OnboardingHeader from "../../components/onboarding/OnboardingHeader";
import OnboardingProgress from "../../components/onboarding/OnboardingProgress";
import OnboardingCard from "../../components/onboarding/OnboardingCard";
import { useOnboarding } from "../../context/OnboardingContext";
import {
  createRazorpayOrder,
  getMembershipPlans,
  verifyRazorpayPayment,
} from "../../services/onboardingService";

const SUMMARY = {
  whatsappNumber: "+91 63851 22237",
};

const WHATSAPP_CHAT_URL = "https://wa.me/916385122237";
const formatCurrency = (amount) => new Intl.NumberFormat("en-IN").format(Number(amount || 0));
const getPriceBreakdown = (plan) => {
  const baseAmount = Number(plan?.baseAmount || 0);
  const gstPercent = Number(plan?.gstPercent || 0);
  const totalAmount = Number(plan?.amount || 0);
  const gstAmount = totalAmount - baseAmount;

  return { baseAmount, gstPercent, gstAmount, totalAmount };
};
const RAZORPAY_CHECKOUT_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

const loadRazorpayCheckout = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(`script[src="${RAZORPAY_CHECKOUT_SCRIPT}"]`);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Could not load Razorpay Checkout.")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_SCRIPT;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Could not load Razorpay Checkout."));
    document.body.appendChild(script);
  });

const CompleteMembership = () => {
  const navigate = useNavigate();
  const { userId } = useOnboarding();
  const [plans, setPlans] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const paymentCompletedRef = useRef(false);
  const selectedPlan = plans.find((plan) => plan.planCode === "FOUNDING_MEMBER") || plans[0];
  const price = getPriceBreakdown(selectedPlan);
  const formattedTotalAmount = formatCurrency(price.totalAmount);

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

  const handleOpenWhatsApp = () => {
    window.open(WHATSAPP_CHAT_URL, "_blank", "noopener,noreferrer");
  };

  const handlePay = async () => {
    if (!userId) {
      setError("Membership not found. Complete Step 1 first.");
      return;
    }

    setIsPaymentLoading(true);
    setError("");
    try {
      await loadRazorpayCheckout();
      const order = await createRazorpayOrder({ userId });

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: order.name,
        description: order.description,
        order_id: order.orderId,
        prefill: order.prefill,
        theme: { color: "#16a34a" },
        handler: async (response) => {
          try {
            const verifiedPayment = await verifyRazorpayPayment({
              userId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifiedPayment?.paymentStatus !== "PAID") {
              throw new Error("Payment was processed, but verification did not complete. Please contact support.");
            }

            paymentCompletedRef.current = true;
            setPaymentVerified(true);
            setError("");
            navigate("/login", { replace: true });
          } catch (err) {
            setPaymentVerified(false);
            setError(err.message || "Payment verification failed. Please contact support before retrying.");
          } finally {
            setIsPaymentLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            if (paymentCompletedRef.current) {
              return;
            }

            setIsPaymentLoading(false);
            setError("Payment was cancelled. Please try again when you are ready.");
          },
        },
      });

      razorpay.on("payment.failed", (response) => {
        setIsPaymentLoading(false);
        setPaymentVerified(false);
        setError(response.error?.description || "Payment failed. Please try again.");
      });

      razorpay.open();
    } catch (err) {
      setPaymentVerified(false);
      setError(err.message);
      setIsPaymentLoading(false);
    }
  };

  const handleContinue = () => {
    if (!paymentVerified) {
      setError("Complete and verify your payment before continuing.");
      return;
    }

    setIsSubmitting(true);
    navigate("/login");
  };
  const handleBack = () => navigate("/onboarding/membership");

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-stone-50 px-4 py-6 sm:py-12">
      <div className="w-full max-w-2xl">
        <OnboardingHeader />
        <OnboardingProgress currentStep={5} />

        <OnboardingCard>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <h1 className="text-2xl font-bold text-gray-900">Complete Your Membership</h1>
          </div>
          <p className="text-gray-500 mb-8">
            Complete your membership payment to continue with the VedaConnect community.
          </p>

          <div className="space-y-3">
            <div className="flex flex-col gap-1 rounded-xl border border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <span className="text-gray-500">Membership Plan</span>
              <span className="font-bold text-gray-900">{selectedPlan?.name || "Membership Plan"}</span>
            </div>

            <div className="flex flex-col gap-1 rounded-xl border border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <span className="text-gray-500">Base Amount</span>
              <span className="font-bold text-gray-900">&#8377;{formatCurrency(price.baseAmount)}</span>
            </div>

            <div className="flex flex-col gap-1 rounded-xl border border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <span className="text-gray-500">GST ({formatCurrency(price.gstPercent)}%)</span>
              <span className="font-bold text-gray-900">&#8377;{formatCurrency(price.gstAmount)}</span>
            </div>

            <div className="flex flex-col gap-1 rounded-xl border-2 border-amber-400 bg-amber-50/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <span className="font-bold text-gray-900">Total Amount</span>
              <span className="text-xl font-extrabold text-green-700">
                &#8377;{formattedTotalAmount}
              </span>
            </div>

            <div className="flex flex-col gap-1 rounded-xl border border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <span className="text-gray-500">WhatsApp Number</span>
              <span className="font-bold text-gray-900">{SUMMARY.whatsappNumber}</span>
            </div>

            <div className="rounded-xl border border-gray-200 px-5 py-4">
              <p className="font-bold text-gray-900 mb-3">Payment Method</p>
              <div className="flex items-center gap-3 rounded-xl bg-green-50/60 border border-green-100 px-4 py-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="h-5 w-5 text-white" />
                  </span>
                  <div>
                    <p className="font-bold text-gray-900">Razorpay</p>
                    <p className="text-sm text-gray-500">Secure online payment</p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handlePay}
                disabled={isPaymentLoading || paymentVerified || isLoadingPlans || !selectedPlan}
                className="w-full inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-green-600 text-gray-900 hover:text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-green-200 ring-2 ring-transparent hover:ring-green-100"
              >
                {isLoadingPlans ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading plan
                  </>
                ) : isPaymentLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Opening Razorpay
                  </>
                ) : paymentVerified ? (
                  "Payment Verified"
                ) : (
                  <>
                    Pay &#8377;{formattedTotalAmount}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300" />
                  </>
                )}
              </button>
            </div>

            {paymentVerified && (
              <div className="flex gap-4 rounded-xl border border-green-200 bg-green-50/70 px-5 py-4">
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-green-700">Payment Successful</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Your &#8377;{formattedTotalAmount} membership payment has been verified
                    successfully. Redirecting you to login...
                  </p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="w-full flex items-center justify-between gap-4 rounded-xl bg-green-50 hover:bg-green-100 border border-green-100 px-5 py-4 transition-colors duration-300 text-left"
            >
              <div className="flex items-center gap-4">
                <span className="h-11 w-11 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="h-5 w-5 text-white" />
                </span>
                <div>
                  <p className="font-bold text-gray-900">Need help with your payment?</p>
                  <p className="text-sm text-gray-500">
                    Chat with the VedaConnect team on WhatsApp.
                  </p>
                  <p className="text-sm font-semibold text-gray-900">{SUMMARY.whatsappNumber}</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex-shrink-0">
                <MessageCircle className="h-3.5 w-3.5" />
                Open WhatsApp
              </span>
            </button>
          </div>
          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

          <div className="mt-9 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
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
              disabled={!paymentVerified || isSubmitting}
              className="group inline-flex items-center gap-2 bg-amber-400 hover:bg-green-600 disabled:bg-amber-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none disabled:ring-0 text-gray-900 hover:text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-green-200 ring-2 ring-transparent hover:ring-green-100"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Confirming
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

export default CompleteMembership;
