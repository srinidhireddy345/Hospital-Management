import { useState, useEffect } from "react";
import { getAppointmentsByPatient, updateAppointmentStatus } from "../../services/appointmentService";
import { getDoctors as fetchDoctors } from "../../services/userService";
import { useAuth } from "../../context/AuthContext";
import AppointmentBookingForm from "../../components/appointments/AppointmentBookingForm";

export default function BookAppointment() {
  const { currentUser } = useAuth();
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetchDoctors().then(setDoctors);
  }, []);

  const handleBookingSuccess = async () => {
    // Optionally redirect to My Appointments or show a toast
    window.location.href = "/patient/my-appointments";
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Book an Appointment</h1>
      <AppointmentBookingForm doctors={doctors} onBookingSuccess={handleBookingSuccess} />
    </div>
  );
}
