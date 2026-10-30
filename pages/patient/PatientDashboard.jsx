import { useState, useEffect } from "react";
import { getDoctors } from "../../services/userService";
import { 
  getAppointmentsByPatient, 
  subscribeToPatientAppointments, 
  cancelAppointmentByPatient 
} from "../../services/appointmentService";
import { getMedicalRecordsByPatient } from "../../services/medicalRecordService";
import { 
  getNotificationsByUser, 
  subscribeToNotifications 
} from "../../services/notificationService";
import { getHealthPackageBookingsByPatient } from "../../services/healthPackageService";
import { useAuth } from "../../context/AuthContext";

// Modular Components
import AppointmentBookingForm from "../../components/appointments/AppointmentBookingForm";
import AppointmentList from "../../components/appointments/AppointmentList";
import MedicalRecordUpload from "../../components/medical-records/MedicalRecordUpload";
import MedicalRecordList from "../../components/medical-records/MedicalRecordList";
import NotificationList from "../../components/notifications/NotificationList";
import HealthPackageList from "../../components/health-packages/HealthPackageList";

export default function PatientDashboard() {
  const { currentUser } = useAuth();
  
  // Data State
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [healthPackageBookings, setHealthPackageBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    // Fetch initial static/semi-static data
    getDoctors().then(setDoctors).catch(console.error);
    getMedicalRecordsByPatient(currentUser.uid).then(setRecords).catch(console.error);
    getHealthPackageBookingsByPatient(currentUser.uid).then(hp => {
      hp.sort((a, b) => new Date(b.preferredDate) - new Date(a.preferredDate));
      setHealthPackageBookings(hp);
    }).catch(console.error);

    // Real-time subscription to appointments
    const unsubAppts = subscribeToPatientAppointments(currentUser.uid, (appts) => {
      appts.sort((a, b) => new Date(b.date) - new Date(a.date));
      setAppointments(appts);
      setLoading(false);
    });

    // Real-time subscription to notifications
    const unsubNotifs = subscribeToNotifications(currentUser.uid, "patient", null, (notifs) => {
      setNotifications(notifs);
    });

    return () => {
      unsubAppts();
      unsubNotifs();
    };
  }, [currentUser]);

  const cancelAppointment = async (id) => {
    const appt = appointments.find(a => a.id === id);
    if (!appt) return;

    if (appt.status === "Cancelled" || appt.bookingStatus === "Cancelled") {
      alert("This appointment is already cancelled.");
      return;
    }
    if (appt.status === "Completed" || appt.bookingStatus === "Completed") {
      alert("Cannot cancel a completed appointment.");
      return;
    }

    if (window.confirm(`Are you sure you want to cancel your appointment with ${appt.doctorName || 'the doctor'}?`)) {
      try {
        await cancelAppointmentByPatient(id, currentUser.uid, "Cancelled by patient");
      } catch (err) {
        console.error("Patient cancellation failed:", err);
        alert(err.message || "Failed to cancel appointment. Please try again.");
      }
    }
  };

  // Callbacks for child components to refresh data
  const handleBookingSuccess = async () => {
    const appts = await getAppointmentsByPatient(currentUser.uid);
    appts.sort((a, b) => new Date(b.date) - new Date(a.date));
    setAppointments(appts);
  };

  const handleUploadSuccess = async () => {
    const recs = await getMedicalRecordsByPatient(currentUser.uid);
    setRecords(recs);
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="text-xl text-medical-primary animate-pulse">Loading Dashboard...</div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Patient Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back! Manage your health records and appointments here.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Booking & Records */}
        <div className="lg:col-span-2 space-y-8">
          <AppointmentBookingForm doctors={doctors} onBookingSuccess={handleBookingSuccess} />
          <AppointmentList appointments={appointments} onCancelAppointment={cancelAppointment} />
          <HealthPackageList healthPackageBookings={healthPackageBookings} />
        </div>

        {/* Right Column: Notifications & Medical Records */}
        <div className="space-y-8">
          <NotificationList notifications={notifications} setNotifications={setNotifications} />
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <MedicalRecordUpload onUploadSuccess={handleUploadSuccess} />
            <div className="mt-6 border-t pt-4">
              <MedicalRecordList records={records} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
