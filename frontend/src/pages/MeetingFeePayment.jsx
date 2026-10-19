import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, ChevronLeft, ChevronRight, CreditCard, Loader2 } from "lucide-react";
import Sidebar from "../components/dashboard/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import {
  createMeetingFeeOrder,
  createMembershipRenewalOrder,
  getMeetingFeeHistory,
  getMeetingFeeStatus,
  verifyMembershipRenewalPayment,
  verifyMeetingFeePayment,
} from "../services/meetingFeeService";
import { MEETING_FEE_PER_SATURDAY } from "../utils/meetingFee";

const RAZORPAY_CHECKOUT_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";
const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    Number(amount || 0)
  );
const formatPaymentDate = (value) => new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "numeric",
  month: "short",
  year: "numeric",
}).format(new Date(value));
const paymentMethodLabel = (payment) => payment.paymentSource === "MANUAL"
  ? `Manual payment${payment.paymentMode ? ` · ${payment.paymentMode.replace("_", " ").toLowerCase()}` : ""}`
  : "Online payment";

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
  const [searchParams] = useSearchParams();
  const isRenewal = searchParams.get("renewal") === "1";
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState("");
  const paymentCompletedRef = useRef(false);

  const load = async () => {
    const [nextStatus, nextHistory] = await Promise.all([getMeetingFeeStatus(), getMeetingFeeHistory()]);
    setStatus(nextStatus);
    setHistory(nextHistory);
    setSelectedMonth(nextStatus.month);
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
      const order = await (isRenewal ? createMembershipRenewalOrder() : createMeetingFeeOrder());

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
            const verified = await (isRenewal ? verifyMembershipRenewalPayment : verifyMeetingFeePayment)({
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

  const selectedPayment = history.find((payment) => payment.month === selectedMonth)
    || (selectedMonth === status?.month ? status : null);
  const isCurrentMonth = selectedMonth === status?.month;
  const isPaid = selectedPayment?.paymentStatus === "PAID";
  const paymentAmount = isRenewal ? status?.renewalAmount : selectedPayment?.amount ?? status?.amount;
  const selectedMonthIndex = history.findIndex((payment) => payment.month === selectedMonth);
  const canGoToPreviousMonth = selectedMonthIndex >= 0 && selectedMonthIndex < history.length - 1;
  const canGoToNextMonth = selectedMonthIndex > 0;
  const selectAdjacentMonth = (offset) => {
    const nextPayment = history[selectedMonthIndex + offset];
    if (nextPayment) setSelectedMonth(nextPayment.month);
  };
  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <DashboardHeader />
        <main className="px-4 py-6 sm:px-6 md:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{isRenewal ? "Renew Membership" : "Meeting Fee"}</h1>
          <p className="text-gray-500 mb-6">{isRenewal ? "Complete your membership renewal securely." : "Pay your monthly VedaConnect meeting fee."}</p>

          <div className="grid max-w-5xl gap-6 lg:grid-cols-2">
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm sm:p-6">
            {isLoading ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading payment status
              </div>
            ) : (
              <>
                <div className="flex flex-col items-start gap-3 mb-6 sm:flex-row sm:justify-between sm:gap-4">
                  <div>
                    <p className="text-sm text-gray-500">{isRenewal ? "Renewal" : isCurrentMonth ? "Current Month" : "Selected Month"}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{isRenewal ? "Membership renewal" : selectedMonth || status?.month}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isRenewal && (
                      <div className="flex items-center rounded-xl border border-gray-100 bg-white p-1">
                        <button type="button" onClick={() => selectAdjacentMonth(1)} disabled={!canGoToPreviousMonth} aria-label="Previous month" className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30">
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => selectAdjacentMonth(-1)} disabled={!canGoToNextMonth} aria-label="Next month" className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30">
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    <span
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${
                        isRenewal ? "bg-amber-50 text-amber-700" : isPaid ? "bg-green-50 text-green-700" : selectedPayment?.paymentStatus === "OVERDUE" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {isRenewal ? <CreditCard className="h-4 w-4" /> : isPaid ? <CheckCircle2 className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                      {isRenewal ? "Ready to renew" : isPaid ? "Paid" : selectedPayment?.paymentStatus === "OVERDUE" ? "Overdue" : "Pending"}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 px-5 py-4 mb-6">
                  <p className="text-sm text-gray-500">Fee Amount</p>
                  <p className="text-3xl font-extrabold text-green-700 mt-1">{formatCurrency(paymentAmount)}</p>
                  {!isRenewal && selectedPayment && (
                    <p className="mt-1 text-sm text-gray-500">
                      {selectedPayment.saturdayCount ?? status?.saturdayCount} Saturdays × {formatCurrency(selectedPayment.perSaturdayAmount || status?.perSaturdayAmount || MEETING_FEE_PER_SATURDAY)} each
                    </p>
                  )}
                </div>

                {!isRenewal && isPaid ? (
                  <div className="rounded-xl border border-green-100 bg-green-50 px-5 py-4 text-green-700">
                    <p className="font-semibold">Paid for {selectedMonth}</p>
                    {selectedPayment?.paidAt && <p className="mt-1 text-sm">Received {formatPaymentDate(selectedPayment.paidAt)}{selectedPayment.paymentSource === "MANUAL" && selectedPayment.paymentMode ? ` · ${selectedPayment.paymentMode.replace("_", " ")}` : ""}</p>}
                  </div>
                ) : !isRenewal && !isCurrentMonth ? (
                  <div className="rounded-xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm text-amber-800">
                    This past month is unpaid. Online payment is available for the current month only.
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handlePay}
                    disabled={isPaying}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3.5 font-semibold text-gray-900 hover:bg-green-600 hover:text-white disabled:opacity-60"
                  >
                    {isPaying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                    Pay {formatCurrency(paymentAmount)}
                  </button>
                )}
              </>
            )}
            {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
          </div>
          {!isRenewal && (
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm sm:p-6">
              <h2 className="font-bold text-gray-900">Payment History</h2>
              <p className="mb-4 text-sm text-gray-500">Your monthly meeting fee payments, newest first.</p>
              <div className="max-h-[28rem] divide-y divide-gray-100 overflow-y-auto">
                {history.map((payment) => {
                  const paid = payment.paymentStatus === "PAID";
                  const overdue = payment.paymentStatus === "OVERDUE";
                  return <button type="button" key={payment.month} onClick={() => setSelectedMonth(payment.month)} aria-current={selectedMonth === payment.month ? "true" : undefined} className={`flex w-full items-center justify-between gap-3 py-3 text-left ${selectedMonth === payment.month ? "bg-amber-50/60" : "hover:bg-gray-50"}`}>
                    <div><p className="font-semibold text-gray-900">{payment.month}</p><p className="text-xs text-gray-500">{paid && payment.paidAt ? `Paid ${formatPaymentDate(payment.paidAt)} · ${paymentMethodLabel(payment)}` : overdue ? "Payment overdue" : "Awaiting payment"}</p></div>
                    <div className="text-right"><p className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</p><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${paid ? "bg-green-50 text-green-700" : overdue ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"}`}>{paid ? "Paid" : overdue ? "Overdue" : "Pending"}</span></div>
                  </button>;
                })}
                {!history.length && <p className="py-5 text-sm text-gray-500">No payment records yet.</p>}
              </div>
            </div>
          )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MeetingFeePayment;
