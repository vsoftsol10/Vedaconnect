import { useEffect, useRef, useState } from "react";
import { CheckCircle2, CreditCard, Loader2 } from "lucide-react";
import Sidebar from "../components/dashboard/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import {
  createMeetingFeeOrder,
  getMeetingFeeStatus,
  verifyMeetingFeePayment,
} from "../services/meetingFeeService";

const RAZORPAY_CHECKOUT_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";
const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    Number(amount || 0)
  );

const loadRazorpayCheckout = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);

    const existing = document.querySelector(`script[src="${RAZORPAY_CHECKOUT_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => reject(new Error("Could not load Razorpay Checkout.")), {
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

const MeetingFeePayment = () => {
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState("");
  const paymentCompletedRef = useRef(false);

  const load = async () => {
    setStatus(await getMeetingFeeStatus());
  };

  useEffect(() => {
    load()
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const handlePay = async () => {
    setIsPaying(true);
    setError("");
    paymentCompletedRef.current = false;
    try {
      await loadRazorpayCheckout();
      const order = await createMeetingFeeOrder();

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
            const verified = await verifyMeetingFeePayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verified?.paymentStatus !== "PAID") {
              throw new Error("Payment was processed, but verification did not complete.");
            }
            paymentCompletedRef.current = true;
            await load();
          } catch (err) {
            setError(err.message || "Payment verification failed.");
          } finally {
            setIsPaying(false);
          }
        },
        modal: {
          ondismiss: () => {
            if (!paymentCompletedRef.current) {
              setError("Payment was cancelled. Please try again when you are ready.");
            }
            setIsPaying(false);
          },
        },
      });

      razorpay.on("payment.failed", (response) => {
        setError(response.error?.description || "Payment failed. Please try again.");
        setIsPaying(false);
      });

      razorpay.open();
    } catch (err) {
      setError(err.message);
      setIsPaying(false);
    }
  };

  const isPaid = status?.paymentStatus === "PAID";

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <DashboardHeader />
        <main className="px-4 py-6 sm:px-6 md:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Meeting Fee</h1>
          <p className="text-gray-500 mb-6">Pay your monthly VedaConnect meeting fee.</p>

          <div className="max-w-xl bg-white border border-gray-100 rounded-2xl p-4 shadow-sm sm:p-6">
            {isLoading ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading payment status
              </div>
            ) : (
              <>
                <div className="flex flex-col items-start gap-3 mb-6 sm:flex-row sm:justify-between sm:gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Current Month</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{status?.month}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${
                      isPaid ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {isPaid ? <CheckCircle2 className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                    {isPaid ? "Paid" : "Pending"}
                  </span>
                </div>

                <div className="rounded-xl border border-gray-200 px-5 py-4 mb-6">
                  <p className="text-sm text-gray-500">Fee Amount</p>
                  <p className="text-3xl font-extrabold text-green-700 mt-1">{formatCurrency(status?.amount)}</p>
                </div>

                {isPaid ? (
                  <div className="rounded-xl border border-green-100 bg-green-50 px-5 py-4 text-green-700 font-semibold">
                    Paid for {status?.month}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handlePay}
                    disabled={isPaying}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3.5 font-semibold text-gray-900 hover:bg-green-600 hover:text-white disabled:opacity-60"
                  >
                    {isPaying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                    Pay {formatCurrency(status?.amount)}
                  </button>
                )}
              </>
            )}
            {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MeetingFeePayment;
