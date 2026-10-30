import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import SelectRole from "../pages/auth/SelectRole";
import PatientDashboard from "../pages/patient/PatientDashboard";
import ReceptionistDashboard from "../pages/receptionist/ReceptionistDashboard";
import DoctorDashboard from "../pages/doctor/DoctorDashboard";
import Profile from "../pages/Profile";
import Home from "../pages/Home";
import BookAppointment from "../pages/patient/BookAppointment";
import MyAppointments from "../pages/patient/MyAppointments";
import HealthPackages from "../pages/patient/HealthPackages";
import PaymentPage from "../pages/patient/PaymentPage";
import HealthPackageBookings from "../pages/patient/HealthPackageBookings";
import Notifications from "../pages/patient/Notifications";
import SearchDoctors from "../pages/patient/SearchDoctors";
import DoctorProfile from "../pages/patient/DoctorProfile";
import DoctorMyAppointments from "../pages/doctor/MyAppointments";
import DoctorMyPatients from "../pages/doctor/MyPatients";
import DoctorNotifications from "../pages/doctor/Notifications";
import ReceptionistAppointments from "../pages/receptionist/Appointments";
import ReceptionistDoctors from "../pages/receptionist/Doctors";
import ReceptionistHealthPackages from "../pages/receptionist/HealthPackages";
import DoctorAvailability from "../pages/receptionist/DoctorAvailability";
import ReceptionistNotifications from "../pages/receptionist/Notifications";

import PatientLayout from "../layouts/PatientLayout";
import DoctorLayout from "../layouts/DoctorLayout";
import ReceptionistLayout from "../layouts/ReceptionistLayout";

function DashboardRedirect() {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-xl text-teal-600 font-semibold animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!userRole) {
    return <Navigate to="/select-role" replace />;
  }

  if (userRole === "doctor") {
    return <Navigate to="/doctor/dashboard" replace />;
  }
  if (userRole === "receptionist" || userRole === "admin") {
    return <Navigate to="/receptionist/dashboard" replace />;
  }
  return <Navigate to="/patient/dashboard" replace />;
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/select-role" element={<SelectRole />} />
      <Route path="/dashboard" element={<DashboardRedirect />} />

      {/* Patient Routes */}
      <Route
        path="/patient/*"
        element={
          <ProtectedRoute allowedRoles={["patient"]}>
            <PatientLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="profile" element={<Profile />} />
        
        {/* Modular Routes */}
        <Route path="book-appointment" element={<BookAppointment />} />
        <Route path="my-appointments" element={<MyAppointments />} />
        <Route path="health-packages" element={<HealthPackages />} />
        <Route path="payment" element={<PaymentPage />} />
        <Route path="health-packages/payment" element={<PaymentPage />} />
        <Route path="health-package-bookings" element={<HealthPackageBookings />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="doctors" element={<SearchDoctors />} />
        <Route path="doctors/:id" element={<DoctorProfile />} />
        
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Receptionist & Admin Routes */}
      <Route
        path="/receptionist/*"
        element={
          <ProtectedRoute allowedRoles={["receptionist", "admin"]}>
            <ReceptionistLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<ReceptionistDashboard />} />
        <Route path="appointments" element={<ReceptionistAppointments />} />
        <Route path="doctors" element={<ReceptionistDoctors />} />
        <Route path="health-packages" element={<ReceptionistHealthPackages />} />
        <Route path="availability" element={<DoctorAvailability />} />
        <Route path="notifications" element={<ReceptionistNotifications />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Admin Alias Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["receptionist", "admin"]}>
            <ReceptionistLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<ReceptionistDashboard />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Doctor Routes */}
      <Route
        path="/doctor/*"
        element={
          <ProtectedRoute allowedRoles={["doctor"]}>
            <DoctorLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="appointments" element={<DoctorMyAppointments />} />
        <Route path="patients" element={<DoctorMyPatients />} />
        <Route path="notifications" element={<DoctorNotifications />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Global Fallback Route */}
      <Route path="*" element={<DashboardRedirect />} />
    </Routes>
  );
};

export default AppRoutes;
