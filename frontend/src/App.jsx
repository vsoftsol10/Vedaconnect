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
import Profile from "./pages/Profile";
import Members from "./pages/Members";
import MemberProfile from "./pages/MemberProfile";
import Networking from "./pages/Networking";
import MeetingFeePayment from "./pages/MeetingFeePayment";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRoute from "./routes/AdminRoute";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminMembers from "./pages/admin/AdminMembers";
import AdminMemberDetail from "./pages/admin/AdminMemberDetail";
import AdminHubs from "./pages/admin/AdminHubs";
import AdminHubDetail from "./pages/admin/AdminHubDetail";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminCreateEvent from "./pages/admin/AdminCreateEvent";
import AdminEventDetail from "./pages/admin/AdminEventDetail";
import AdminEditEvent from "./pages/admin/AdminEditEvent";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminSubscriptionForm from "./pages/admin/AdminSubscriptionForm";
import AdminPaymentHistory from "./pages/admin/AdminPaymentHistory";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminLeaderboard from "./pages/admin/AdminLeaderboard";



 

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
                MEMBER PORTAL
            ================================= */}

            <Route
              path="/dashboard"
              element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
            />

            <Route
              path="/members"
              element={<ProtectedRoute><Members /></ProtectedRoute>}
            />

            <Route
              path="/members/:userId"
              element={<ProtectedRoute><MemberProfile /></ProtectedRoute>}
            />

            <Route
              path="/networking"
              element={<ProtectedRoute><Networking /></ProtectedRoute>}
            />

            <Route
              path="/meeting-fee"
              element={<ProtectedRoute><MeetingFeePayment /></ProtectedRoute>}
            />

            <Route
              path="/events"
              element={<ProtectedRoute><Events /></ProtectedRoute>}
            />

            <Route
              path="/events/:eventId"
              element={<ProtectedRoute><EventDetail /></ProtectedRoute>}
            />

            <Route
              path="/profile"
              element={<ProtectedRoute><Profile /></ProtectedRoute>}
            />
            <Route
              path="/admin/dashboard" 
              element={<AdminRoute><AdminDashboard /></AdminRoute>}
            />

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/members" element={<AdminRoute><AdminMembers /></AdminRoute>} />
            <Route path="/admin/members/:userId" element={<AdminRoute><AdminMemberDetail /></AdminRoute>} />
            <Route path="/admin/hubs" element={<AdminRoute><AdminHubs /></AdminRoute>} />
            <Route path="/admin/hubs/:id" element={<AdminRoute><AdminHubDetail /></AdminRoute>} />
            <Route path="/admin/events" element={<AdminRoute><AdminEvents /></AdminRoute>} />
            <Route path="/admin/events/create" element={<AdminRoute><AdminCreateEvent /></AdminRoute>} />
            <Route path="/admin/events/:id" element={<AdminRoute><AdminEventDetail /></AdminRoute>} />
            <Route path="/admin/events/:id/edit" element={<AdminRoute><AdminEditEvent /></AdminRoute>} />
            <Route path="/admin/leaderboard" element={<AdminRoute><AdminLeaderboard /></AdminRoute>} />
            <Route path="/admin/subscriptions" element={<AdminRoute><AdminSubscriptions /></AdminRoute>} />
            <Route path="/admin/subscriptions/new" element={<AdminRoute><AdminSubscriptionForm /></AdminRoute>} />
            <Route path="/admin/subscriptions/:id" element={<AdminRoute><AdminSubscriptionForm /></AdminRoute>} />
            <Route path="/admin/payment-history" element={<AdminRoute><AdminPaymentHistory /></AdminRoute>} />
            <Route path="/admin/profile" element={<AdminRoute><AdminProfile /></AdminRoute>} />

          </Routes>
        </OnboardingProvider>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
