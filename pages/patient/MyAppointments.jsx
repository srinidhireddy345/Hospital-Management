import { useState, useEffect } from "react";
import { 
  subscribeToPatientAppointments, 
  cancelAppointmentByPatient 
} from "../../services/appointmentService";
import { useAuth } from "../../context/AuthContext";
import AppointmentList from "../../components/appointments/AppointmentList";

export default function MyAppointments() {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);

    const unsubscribe = subscribeToPatientAppointments(currentUser.uid, (appts) => {
      appts.sort((a, b) => new Date(b.date) - new Date(a.date));
      setAppointments(appts);
      setLoading(false);
    });

    return () => unsubscribe();
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
        console.error("Failed to cancel appointment", err);
        alert(err.message || "Failed to cancel appointment. Please try again.");
      }
    }
  };

  if (loading) return <div>Loading appointments...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
      <AppointmentList appointments={appointments} onCancelAppointment={cancelAppointment} />
    </div>
  );
}
