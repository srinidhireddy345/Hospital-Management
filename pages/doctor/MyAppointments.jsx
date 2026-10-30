import { useState, useEffect } from "react";
import { 
  subscribeToDoctorAppointments, 
  completeAppointment, 
  cancelAppointmentByDoctor 
} from "../../services/appointmentService";
import { useAuth } from "../../context/AuthContext";
import { Calendar, Filter, FileText, X, CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";
import { DOCTORS, formatDoctorName, formatDateDisplay } from "../../data/doctors";

export default function MyAppointments() {
  const { currentUser, userProfile } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");

  // Modal state for completing consultation notes
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [notes, setNotes] = useState("");
  const [completing, setCompleting] = useState(false);

  // Cancellation Modal state
  const [cancelModalAppt, setCancelModalAppt] = useState(null);
  const [cancelReasonPreset, setCancelReasonPreset] = useState("Doctor unavailable due to medical emergency");
  const [customCancelReason, setCustomCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState("");
  const [actionErrorMessage, setActionErrorMessage] = useState("");

  // Centralized doctor resolution strictly for logged-in doctor
  const doctorId = userProfile?.doctorId || (() => {
    if (currentUser?.uid) {
      const matchUid = DOCTORS.find(d => d.doctorId === currentUser.uid || d.id === currentUser.uid);
      if (matchUid) return matchUid.doctorId;
    }
    if (userProfile?.name || currentUser?.displayName) {
      const searchName = (userProfile?.name || currentUser?.displayName || "").replace(/^(dr\.?\s*)+/i, "").trim().toLowerCase();
      const matchName = DOCTORS.find(d => 
        d.name.toLowerCase().replace(/^(dr\.?\s*)+/i, "").trim().includes(searchName)
      );
      if (matchName) return matchName.doctorId;
    }
    return "doc-01"; // Dr. Arjun Mehta
  })();

  const currentDoctor = DOCTORS.find(d => d.doctorId === doctorId) || DOCTORS[0];

  // Subscribe in real-time to the doctor's appointments
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToDoctorAppointments(doctorId, currentDoctor?.name, (appts) => {
      appts.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
      setAppointments(appts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [doctorId, currentDoctor]);

  const openCompleteModal = (appt) => {
    setActiveAppointment(appt);
    setNotes(appt.notes || "");
  };

  const handleComplete = async () => {
    if (!activeAppointment) return;
    setCompleting(true);
    try {
      await completeAppointment(activeAppointment.id, notes);
      setActionSuccessMessage(`Consultation notes saved and marked as Completed.`);
      setActiveAppointment(null);
      setNotes("");
      setTimeout(() => setActionSuccessMessage(""), 5000);
    } catch (error) {
      console.error("Failed to complete appointment", error);
      setActionErrorMessage(error.message || "Failed to complete appointment.");
    } finally {
      setCompleting(false);
    }
  };

  // Open cancellation confirmation popup
  const openCancelModal = (appt) => {
    // Edge cases check
    if (appt.status === "Cancelled" || appt.bookingStatus === "Cancelled") {
      alert("This appointment is already cancelled.");
      return;
    }
    if (appt.status === "Completed" || appt.bookingStatus === "Completed") {
      alert("Cannot cancel a completed appointment.");
      return;
    }

    setCancelModalAppt(appt);
    setCancelReasonPreset("Doctor unavailable due to medical emergency");
    setCustomCancelReason("");
    setActionErrorMessage("");
  };

  // Confirm doctor cancellation
  const handleConfirmCancellation = async () => {
    if (!cancelModalAppt || cancelling) return;

    setCancelling(true);
    setActionErrorMessage("");

    try {
      const finalReason = cancelReasonPreset === "Other reason" 
        ? (customCancelReason.trim() || "Doctor unavailable")
        : (customCancelReason.trim() ? `${cancelReasonPreset} (${customCancelReason.trim()})` : cancelReasonPreset);

      await cancelAppointmentByDoctor(
        cancelModalAppt.id, 
        doctorId, 
        finalReason, 
        formatDoctorName(currentDoctor.name)
      );

      setActionSuccessMessage(`Appointment with ${cancelModalAppt.patientName} has been cancelled. Patient and front-desk have been notified.`);
      setCancelModalAppt(null);
      setCustomCancelReason("");
      setTimeout(() => setActionSuccessMessage(""), 6000);
    } catch (err) {
      console.error("Doctor cancellation error:", err);
      setActionErrorMessage(err.message || "Failed to cancel appointment. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  const filteredAppointments = appointments.filter(a => {
    const status = a.bookingStatus || a.status;
    if (filterStatus !== "All" && status !== filterStatus) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-xl text-medical-primary animate-pulse font-medium">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-medical-primary" /> My Appointments
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">
            Viewing records for <span className="font-semibold text-medical-primary">{formatDoctorName(currentDoctor?.name)}</span> ({currentDoctor?.department} &bull; {currentDoctor?.location})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
            <Filter size={14} className="text-gray-400" />
            <select 
              className="text-xs font-medium border-0 p-0 text-gray-700 bg-transparent focus:ring-0 cursor-pointer"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Statuses ({appointments.length})</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            {actionSuccessMessage}
          </div>
          <button onClick={() => setActionSuccessMessage("")} className="text-emerald-600 hover:text-emerald-800">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Error Notification Alert */}
      {actionErrorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2 text-sm font-medium">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            {actionErrorMessage}
          </div>
          <button onClick={() => setActionErrorMessage("")} className="text-red-600 hover:text-red-800">
            <X size={18} />
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="space-y-4">
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p className="text-base font-medium text-gray-600">No {filterStatus !== 'All' ? filterStatus.toLowerCase() : ''} appointments found.</p>
                <p className="text-xs text-gray-400 mt-1">New patient bookings will appear here automatically in real time.</p>
              </div>
            ) : (
              filteredAppointments.map((appt) => {
                const effectiveStatus = appt.bookingStatus || appt.status || "Confirmed";
                const isCancellable = effectiveStatus === "Confirmed" || effectiveStatus === "Pending";
                return (
                  <div key={appt.id} className="border border-gray-100 rounded-xl p-5 flex flex-col md:flex-row justify-between md:items-center hover:border-gray-200 transition-all bg-gray-50/50 hover:bg-white shadow-xs">
                    <div className="space-y-1.5 flex-1 pr-4">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-gray-900 text-base">{appt.patientName}</h3>
                        {appt.bookingId && (
                          <span className="text-xs font-mono text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-200">
                            {appt.bookingId}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm flex items-center gap-2">
                        <Clock size={14} className="text-medical-primary" />
                        <span className="font-medium text-medical-primary">{formatDateDisplay(appt.date)}</span> at <span className="font-medium">{appt.timeSlot}</span>
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span><strong className="text-gray-700">Specialty:</strong> {appt.department || currentDoctor?.department}</span>
                        <span><strong className="text-gray-700">Location:</strong> {appt.location || currentDoctor?.location}</span>
                        {appt.reason && <span><strong className="text-gray-700">Reason:</strong> {appt.reason}</span>}
                      </div>

                      {/* Cancellation reason if cancelled */}
                      {effectiveStatus === "Cancelled" && (
                        <div className="mt-2 bg-red-50 p-2.5 rounded-lg text-xs border border-red-100 text-red-900">
                          <span className="font-semibold flex items-center gap-1 text-red-700">
                            <XCircle size={13} /> Cancellation Details:
                          </span>
                          <p className="mt-0.5 text-red-800">
                            {appt.cancelReason || appt.cancellationReason || "Cancelled"}
                            {appt.cancelledBy ? ` • Cancelled by ${appt.cancelledBy}` : ""}
                          </p>
                        </div>
                      )}

                      {appt.notes && (
                        <div className="mt-2 bg-blue-50 p-2.5 rounded-lg text-xs border border-blue-100">
                          <span className="font-semibold text-blue-900 flex items-center gap-1"><FileText size={13}/> Consultation Notes:</span>
                          <p className="text-blue-800 mt-0.5">{appt.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 md:mt-0 flex flex-col md:items-end justify-between gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        effectiveStatus === 'Confirmed' ? 'bg-green-100 text-green-800' :
                        effectiveStatus === 'Completed' ? 'bg-blue-100 text-blue-800' :
                        effectiveStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {effectiveStatus}
                      </span>

                      <div className="flex flex-wrap gap-2">
                        {/* Complete Consultation Button */}
                        {effectiveStatus === 'Confirmed' && (
                          <button 
                            onClick={() => openCompleteModal(appt)} 
                            className="text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 border border-blue-200 bg-white text-xs font-medium shadow-xs" 
                            title="Add Notes & Complete"
                          >
                            <FileText size={14} /> Add Notes & Complete
                          </button>
                        )}

                        {/* Doctor Cancel Appointment Button */}
                        {isCancellable && (
                          <button 
                            onClick={() => openCancelModal(appt)} 
                            className="text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 border border-red-200 bg-white text-xs font-medium shadow-xs" 
                            title="Cancel Appointment"
                          >
                            <XCircle size={14} /> Cancel Appointment
                          </button>
                        )}

                        {effectiveStatus === 'Completed' && (
                          <span className="text-xs text-gray-500 flex items-center gap-1 py-1">
                            <CheckCircle size={14} className="text-emerald-600" /> Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Doctor Consultation Notes Modal */}
      {activeAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Consultation Notes</h3>
              <button onClick={() => setActiveAppointment(null)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-3.5 rounded-lg text-sm space-y-1 border border-gray-200">
                <p><strong>Patient:</strong> {activeAppointment.patientName}</p>
                <p><strong>Date & Time:</strong> {formatDateDisplay(activeAppointment.date)} at {activeAppointment.timeSlot}</p>
                <p><strong>Department & Location:</strong> {activeAppointment.department || currentDoctor.department} ({activeAppointment.location || currentDoctor.location})</p>
                {activeAppointment.reason && <p><strong>Symptoms/Reason:</strong> {activeAppointment.reason}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis & Clinical Remarks</label>
                <textarea 
                  className="w-full p-3 border rounded-lg focus:ring-medical-primary min-h-[120px] text-sm" 
                  placeholder="Enter consultation notes, diagnosis, and prescription details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
              </div>
              
              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setActiveAppointment(null)} 
                  className="flex-1 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleComplete} 
                  disabled={completing || !notes.trim()}
                  className="flex-1 bg-medical-primary text-white py-2 rounded-lg hover:bg-medical-dark font-medium text-sm disabled:opacity-50"
                >
                  {completing ? "Saving..." : "Mark as Completed"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Cancel Appointment Confirmation Modal */}
      {cancelModalAppt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b flex justify-between items-center bg-red-50/50 rounded-t-xl">
              <div className="flex items-center gap-2 text-red-700">
                <XCircle size={22} />
                <h3 className="text-lg font-bold">Cancel Appointment</h3>
              </div>
              <button 
                onClick={() => setCancelModalAppt(null)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-lg text-sm space-y-1 border border-gray-200">
                <p><strong>Patient:</strong> {cancelModalAppt.patientName}</p>
                <p><strong>Scheduled Slot:</strong> {formatDateDisplay(cancelModalAppt.date)} at {cancelModalAppt.timeSlot}</p>
                {cancelModalAppt.reason && <p><strong>Visit Reason:</strong> {cancelModalAppt.reason}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Reason for Cancellation <span className="text-red-500">*</span>
                </label>
                <select
                  value={cancelReasonPreset}
                  onChange={(e) => setCancelReasonPreset(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-red-500 focus:border-red-500 font-medium mb-3"
                >
                  <option value="Doctor unavailable due to medical emergency">Doctor unavailable due to medical emergency</option>
                  <option value="Doctor is on emergency leave / out of hospital">Doctor is on emergency leave / out of hospital</option>
                  <option value="Urgent surgery / clinical schedule conflict">Urgent surgery / clinical schedule conflict</option>
                  <option value="Hospital clinic closed unexpectedly">Hospital clinic closed unexpectedly</option>
                  <option value="Other reason">Other reason (specify below)</option>
                </select>

                <textarea
                  className="w-full p-3 border rounded-lg focus:ring-red-500 text-sm min-h-[90px]"
                  placeholder="Additional remarks or instructions for the patient and reception..."
                  value={customCancelReason}
                  onChange={(e) => setCustomCancelReason(e.target.value)}
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600" />
                <span>
                  Confirming cancellation will update the appointment in Firebase and immediately send notification alerts to both the <strong>Patient</strong> and <strong>Hospital Receptionists</strong>.
                </span>
              </div>

              {actionErrorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
                  {actionErrorMessage}
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setCancelModalAppt(null)}
                  disabled={cancelling}
                  className="flex-1 py-2.5 border rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm"
                >
                  Keep Appointment
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancellation}
                  disabled={cancelling}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {cancelling ? "Cancelling..." : "Confirm Cancellation"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
