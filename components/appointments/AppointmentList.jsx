import { Calendar } from "lucide-react";
import StatusBadge from "../common/StatusBadge";
import { formatDoctorName, formatDateDisplay } from "../../data/doctors";

export default function AppointmentList({ appointments, onCancelAppointment }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold mb-6 text-medical-dark border-b pb-4">My Appointments</h2>
      {appointments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="w-10 h-10 mx-auto text-gray-300 mb-2" />
          <p>No appointments yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div key={appt.id} className="border border-gray-100 rounded-lg p-4 flex flex-col md:flex-row justify-between md:items-center hover:border-medical-primary transition-colors bg-gray-50">
              <div>
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  {formatDoctorName(appt.doctorName)}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  <span className="font-medium text-medical-primary">{formatDateDisplay(appt.date)}</span> at <span className="font-medium">{appt.timeSlot}</span>
                  {appt.department && <span className="text-gray-400"> • </span>}
                  {appt.department && <span className="text-gray-600">{appt.department}</span>}
                  {appt.location && <span className="text-gray-400"> ({appt.location})</span>}
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex flex-col items-end gap-3">
                <StatusBadge status={appt.status} />
                {(appt.status === 'Pending' || appt.status === 'Confirmed') && onCancelAppointment && (
                  <button 
                    onClick={() => onCancelAppointment(appt.id)}
                    className="text-xs text-red-600 hover:text-red-800 font-medium underline"
                  >
                    Cancel Appointment
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
