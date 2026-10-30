import { useState, useEffect } from "react";
import { 
  getAllAppointments, 
  subscribeToAllAppointments,
  updateAppointmentStatus, 
  rescheduleAppointment, 
  getAppointmentsByDoctor,
  cancelAppointmentByReceptionist,
  confirmAppointmentByReceptionist,
  sendAppointmentReminder
} from "../../services/appointmentService";
import { getDoctorAvailability } from "../../services/availabilityService";
import { CheckCircle, XCircle, CalendarClock, X, Bell } from "lucide-react";
import { formatDoctorName, formatDateDisplay } from "../../data/doctors";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [rescheduleAppt, setRescheduleAppt] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotMessage, setSlotMessage] = useState("");
  const [rescheduling, setRescheduling] = useState(false);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToAllAppointments((appts) => {
      appts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      setAppointments(appts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAppointmentStatus = async (appt, status) => {
    try {
      if (status === "Cancelled") {
        const reason = window.prompt(
          `Cancel appointment for ${appt.patientName}?\nEnter reason:`, 
          "Cancelled by hospital reception"
        );
        if (reason === null) return;
        await cancelAppointmentByReceptionist(appt.id, reason.trim() || "Cancelled by hospital reception");
      } else if (status === "Confirmed") {
        await confirmAppointmentByReceptionist(appt.id);
      } else {
        await updateAppointmentStatus(appt.id, status);
      }
    } catch (error) {
      console.error("Failed to update status", error);
      alert(error.message || "Failed to update appointment status.");
    }
  };

  const handleSendReminder = async (appt) => {
    try {
      await sendAppointmentReminder(appt.id);
      alert(`Reminder notification sent to ${appt.patientName} and Dr. ${formatDoctorName(appt.doctorName)}.`);
    } catch (error) {
      console.error("Failed to send reminder", error);
      alert("Failed to send reminder: " + (error.message || "Unknown error"));
    }
  };

  useEffect(() => {
    if (rescheduleAppt && newDate) {
      fetchSlots(rescheduleAppt.doctorId, newDate);
    } else {
      setAvailableSlots([]);
    }
  }, [rescheduleAppt, newDate]);

  const fetchSlots = async (doctorId, date) => {
    setLoadingSlots(true);
    setSlotMessage("");
    setNewTime("");
    try {
      const availability = await getDoctorAvailability(doctorId, date);
      if (availability.length === 0) {
        setAvailableSlots([]);
        setSlotMessage("Doctor is not available on this date.");
        return;
      }
      
      const av = availability[0];
      const slots = [];
      let current = new Date(`1970-01-01T${av.startTime}:00`);
      const end = new Date(`1970-01-01T${av.endTime}:00`);
      
      while (current < end) {
        let h = current.getHours();
        let m = current.getMinutes();
        let ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12; h = h ? h : 12;
        let hStr = h < 10 ? '0'+h : h;
        let mStr = m < 10 ? '0'+m : m;
        
        let next = new Date(current);
        next.setMinutes(next.getMinutes() + av.duration);
        
        if (next <= end) {
          slots.push(`${hStr}:${mStr} ${ampm}`);
        }
        current = next;
      }
      
      const appts = await getAppointmentsByDoctor(doctorId);
      const booked = appts.filter(a => a.date === date && (a.status === 'Confirmed' || a.status === 'Pending') && a.id !== rescheduleAppt.id).map(a => a.timeSlot);
      
      const freeSlots = slots.filter(s => !booked.includes(s));
      setAvailableSlots(freeSlots);
      if (freeSlots.length === 0) {
        setSlotMessage("All slots are booked for this date.");
      }
    } catch (error) {
      console.error(error);
      setSlotMessage("Error fetching slots.");
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleReschedule = async () => {
    if (!newDate || !newTime) return;
    setRescheduling(true);
    try {
      await rescheduleAppointment(rescheduleAppt.id, rescheduleAppt.doctorId, newDate, newTime);
      setAppointments(appointments.map(a => a.id === rescheduleAppt.id ? { ...a, date: newDate, timeSlot: newTime, status: 'Confirmed' } : a));
      
      // Notify Patient
      await createNotification(
        rescheduleAppt.patientId, 
        `Your appointment has been RESCHEDULED to ${newDate} at ${newTime}.`
      );
      // Notify Doctor
      await createNotification(
        rescheduleAppt.doctorId, 
        `Appointment with ${rescheduleAppt.patientName} has been RESCHEDULED to ${newDate} at ${newTime}.`
      );
      
      setRescheduleAppt(null);
      setNewDate("");
      setNewTime("");
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to reschedule");
    } finally {
      setRescheduling(false);
    }
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="text-xl text-medical-primary animate-pulse">Loading Appointments...</div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Manage Appointments</h2>
      </div>
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 font-medium border-b">
            <tr>
              <th className="py-3 px-4">Patient</th>
              <th className="py-3 px-4">Doctor</th>
              <th className="py-3 px-4">Date & Time</th>
              <th className="py-3 px-4">Reason</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-4 text-center text-gray-500">No appointments found</td>
              </tr>
            ) : (
              appointments.map(appt => (
                <tr key={appt.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{appt.patientName}</td>
                  <td className="py-3 px-4 text-gray-600">{formatDoctorName(appt.doctorName)}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {formatDateDisplay(appt.date)} at {appt.timeSlot}
                  </td>
                  <td className="py-3 px-4 text-gray-600 max-w-[150px] truncate" title={appt.reason}>
                    {appt.reason}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      appt.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                      appt.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                      appt.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {appt.status}
                    </span>
                    {appt.status === 'Cancelled' && (appt.cancelReason || appt.cancelledBy) && (
                      <div className="text-[11px] text-red-600 mt-1 max-w-[140px] truncate" title={appt.cancelReason}>
                        {appt.cancelledBy ? `${appt.cancelledBy}: ` : ''}{appt.cancelReason}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2 items-center">
                      {appt.status === 'Pending' && (
                        <button onClick={() => handleAppointmentStatus(appt, 'Confirmed')} className="text-green-600 hover:bg-green-50 p-1 rounded transition-colors" title="Confirm">
                          <CheckCircle size={18} />
                        </button>
                      )}
                      {appt.status === 'Confirmed' && (
                        <button onClick={() => handleSendReminder(appt)} className="text-amber-600 hover:bg-amber-50 p-1 rounded transition-colors" title="Send Reminder">
                          <Bell size={18} />
                        </button>
                      )}
                      {(appt.status === 'Pending' || appt.status === 'Confirmed') && (
                        <button onClick={() => { setRescheduleAppt(appt); setNewDate(""); setNewTime(""); }} className="text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors" title="Reschedule">
                          <CalendarClock size={18} />
                        </button>
                      )}
                      {(appt.status === 'Pending' || appt.status === 'Confirmed') && (
                        <button onClick={() => handleAppointmentStatus(appt, 'Cancelled')} className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors" title="Cancel">
                          <XCircle size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {rescheduleAppt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Reschedule Appointment</h3>
              <button onClick={() => setRescheduleAppt(null)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-3 rounded-md text-sm border border-gray-100 mb-4">
                <p><strong>Patient:</strong> {rescheduleAppt.patientName}</p>
                <p><strong>Doctor:</strong> {formatDoctorName(rescheduleAppt.doctorName)}</p>
                <p><strong>Current:</strong> {formatDateDisplay(rescheduleAppt.date)} at {rescheduleAppt.timeSlot}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Date</label>
                <input 
                  type="date" 
                  min={new Date().toISOString().split("T")[0]}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-medical-primary" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Time {loadingSlots && <span className="text-medical-primary text-xs">(Loading...)</span>}
                </label>
                <select 
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  disabled={!newDate || loadingSlots || availableSlots.length === 0}
                  className="w-full p-2 border rounded-lg focus:ring-medical-primary"
                >
                  <option value="">-- Select Time --</option>
                  {availableSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
                {slotMessage && <p className="text-xs text-red-600 mt-1">{slotMessage}</p>}
              </div>
              
              <div className="pt-4 flex gap-3">
                <button onClick={() => setRescheduleAppt(null)} className="flex-1 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
                  Cancel
                </button>
                <button 
                  onClick={handleReschedule} 
                  disabled={!newDate || !newTime || rescheduling} 
                  className="flex-1 bg-medical-primary text-white py-2 rounded-lg hover:bg-medical-dark font-medium disabled:opacity-50"
                >
                  {rescheduling ? "Saving..." : "Reschedule"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
