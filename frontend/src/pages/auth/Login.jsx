import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingHeader from "../../components/onboarding/OnboardingHeader";
import OnboardingCard from "../../components/onboarding/OnboardingCard";
import LoginForm from "../../components/auth/LoginForm";
import { login as loginRequest } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (form) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const { token, user } = await loginRequest(form);
      login(token, user);
      navigate("/dashboard");
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-stone-50 px-4 py-6 sm:py-12">
      <div className="w-full max-w-md">
        <OnboardingHeader />
        <OnboardingCard>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <h1 className="text-2xl font-bold text-gray-900">Member Login</h1>
          </div>
          <p className="text-gray-500 mb-8">Log in to your VedaConnect account.</p>
          <LoginForm onSubmit={handleSubmit} isLoading={isLoading} errorMessage={errorMessage} />
        </OnboardingCard>
      </div>
    </div>
  );
};

export default Login;
