import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PersonalDetails from "./pages/onboarding/PersonalDetails";
import BusinessDetails from "./pages/onboarding/BusinessDetails";
import BusinessCertificate from "./pages/onboarding/BusinessCertificate";
import MembershipPlan from "./pages/onboarding/MembershipPlan";
import CompleteMembership from "./pages/onboarding/CompleteMembership";
import { OnboardingProvider } from "./context/OnboardingContext";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/auth/Login";


const App = () => {
  return (
    <AuthProvider>
    <BrowserRouter>
      <OnboardingProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/onboarding/personal-details" replace />} />
          <Route path="/onboarding/personal-details" element={<PersonalDetails />} />
          <Route path="/onboarding/business-details" element={<BusinessDetails />} />
          <Route path="/onboarding/business-certificate" element={<BusinessCertificate />} />
          <Route path="/onboarding/membership" element={<MembershipPlan />} />
          <Route path="/onboarding/complete-membership" element={<CompleteMembership />} />
          <Route path="/login" element={<Login />} />         
        </Routes>
      </OnboardingProvider>
    </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
