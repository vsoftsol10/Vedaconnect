import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import PersonalDetails from "./pages/onboarding/PersonalDetails";
import BusinessDetails from "./pages/onboarding/BusinessDetails";
import BusinessCertificate from "./pages/onboarding/BusinessCertificate";
import MembershipPlan from "./pages/onboarding/MembershipPlan";
import CompleteMembership from "./pages/onboarding/CompleteMembership";

import { OnboardingProvider } from "./context/OnboardingContext";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";

// Keep this import for future protected routes
import ProtectedRoute from "./routes/ProtectedRoute";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <OnboardingProvider>
          <Routes>

            {/* Default */}
            <Route
              path="/"
              element={
                <Navigate
                  to="/onboarding/personal-details"
                  replace
                />
              }
            />

            {/* ================================
                ONBOARDING
            ================================= */}

            <Route
              path="/onboarding/personal-details"
              element={<PersonalDetails />}
            />

            <Route
              path="/onboarding/business-details"
              element={<BusinessDetails />}
            />

            <Route
              path="/onboarding/business-certificate"
              element={<BusinessCertificate />}
            />

            <Route
              path="/onboarding/membership"
              element={<MembershipPlan />}
            />

            <Route
              path="/onboarding/complete-membership"
              element={<CompleteMembership />}
            />

            {/* ================================
                AUTHENTICATION
            ================================= */}

            <Route
              path="/login"
              element={<Login />}
            />

            {/* ================================
                TEMPORARY NORMAL ROUTES
                FOR TESTING
            ================================= */}

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/members"
              element={<Members />}
            />

            <Route
              path="/events"
              element={<Events />}
            />

            <Route
              path="/events/:eventId"
              element={<EventDetail />}
            />

            {/* ================================
                FUTURE PROTECTED ROUTES

                When authentication is ready,
                replace the above normal routes
                with ProtectedRoute versions.

                Example:

                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/members"
                  element={
                    <ProtectedRoute>
                      <Members />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/events"
                  element={
                    <ProtectedRoute>
                      <Events />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/events/:eventId"
                  element={
                    <ProtectedRoute>
                      <EventDetail />
                    </ProtectedRoute>
                  }
                />
            ================================= */}

          </Routes>
        </OnboardingProvider>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;