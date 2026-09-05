import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;  // <-- changed from "/login"
  if (user?.role !== "ADMIN") return <Navigate to="/dashboard" replace />;
  return children;
};

export default AdminRoute;