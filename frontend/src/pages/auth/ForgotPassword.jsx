import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import OnboardingHeader from "../../components/onboarding/OnboardingHeader";
import OnboardingCard from "../../components/onboarding/OnboardingCard";
import { requestPasswordReset } from "../../services/authService";

export default function ForgotPassword() {
  const [memberId, setMemberId] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const result = await requestPasswordReset(memberId);
      setIsSuccess(true);
      setMessage(result.message);
    } catch (error) {
      setIsSuccess(false);
      setMessage(error.message || "Could not request a reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md">
        <OnboardingHeader />
        <OnboardingCard>
          <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
          <p className="mb-6 mt-1 text-gray-500">
            Enter your Member ID and we’ll email a reset link to the address on your account.
          </p>
          <form onSubmit={submit} className="space-y-4">
            <label className="sr-only" htmlFor="member-id">Member ID</label>
            <input
              id="member-id"
              required
              value={memberId}
              onChange={(event) => setMemberId(event.target.value)}
              placeholder="Member ID (for example, VC-FM-00001)"
              autoCapitalize="characters"
              className="w-full rounded-xl border border-gray-200 px-4 py-3.5 outline-none focus:border-green-500"
            />
            <button disabled={loading} className="w-full rounded-xl bg-amber-400 py-3.5 font-semibold text-gray-900 disabled:opacity-60">
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
          {message && <div role="alert" className={`mt-4 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${isSuccess ? "border-green-100 bg-green-50 text-green-700" : "border-red-100 bg-red-50 text-red-600"}`}>
            {isSuccess ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
            <span>{message}</span>
          </div>}
          <Link to="/login" className="mt-5 inline-flex min-h-11 items-center text-sm font-medium text-green-700">Back to login</Link>
        </OnboardingCard>
      </div>
    </div>
  );
}
