import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-xl text-teal-600 font-semibold animate-pulse">Loading...</div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated but has NO role yet, redirect to role selection screen
  if (!userRole) {
    return <Navigate to="/select-role" replace />;
  }

  // Enforce role-based access control
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (userRole === "patient") return <Navigate to="/patient/dashboard" replace />;
    if (userRole === "doctor") return <Navigate to="/doctor/dashboard" replace />;
    if (userRole === "receptionist" || userRole === "admin") return <Navigate to="/receptionist/dashboard" replace />;
    return <Navigate to="/select-role" replace />;
  }

  return children;
}
