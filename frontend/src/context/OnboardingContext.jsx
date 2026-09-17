import { createContext, useContext, useMemo, useState } from "react";

const OnboardingContext = createContext(null);

export const OnboardingProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [onboardingToken, setOnboardingToken] = useState(null);
  const value = useMemo(() => ({ userId, setUserId, onboardingToken, setOnboardingToken }), [userId, onboardingToken]);

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};
