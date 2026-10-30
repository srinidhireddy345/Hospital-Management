import { useState, useEffect, useMemo } from "react";
import { 
  getAppointmentsByDoctor, 
  subscribeToDoctorAppointments, 
  completeAppointment, 
  cancelAppointmentByDoctor 
} from "../../services/appointmentService";
import { useAuth } from "../../context/AuthContext";
import { 
  Calendar, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  X, 
  ArrowRight, 
  MapPin, 
  Stethoscope,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import DOCTORS, { formatDoctorName, formatDateDisplay, getDoctorById } from "../../data/doctors";

export default function DoctorDashboard() {
  const { currentUser, userProfile } = useAuth();
  
  // Resolve logged-in doctor's unique doctorId:
  // 1. From userProfile.doctorId
  // 2. Or matched by userProfile.name / currentUser.displayName against DOCTORS
  // 3. Or default to doc-01 (Dr. Arjun Mehta)
  const doctorId = useMemo(() => {
    if (userProfile?.doctorId) return userProfile.doctorId;
    const searchName = (userProfile?.name || currentUser?.displayName || "").replace(/^(dr\.?\s*)+/i, "").trim().toLowerCase();
    if (searchName) {
      const match = DOCTORS.find(d => d.name.toLowerCase().replace(/^(dr\.?\s*)+/i, "").trim().includes(searchName));
      if (match) return match.doctorId;
    }
    return "doc-01"; // Dr. Arjun Mehta
  }, [userProfile, currentUser]);

  const currentDoctor = useMemo(() => {
    const found = getDoctorById(doctorId);
    if (found) return found;
    return {
      doctorId: doctorId,
      name: userProfile?.name || currentUser?.displayName || "Dr. Arjun Mehta",
      department: userProfile?.specialization || userProfile?.department || "Cardiology",
      location: userProfile?.location || "Hyderabad"
    };
  }, [doctorId, userProfile, currentUser]);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // all, upcoming, today, completed, cancelled

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

  // Subscribe to realtime appointment updates belonging ONLY to this doctor's doctorId
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToDoctorAppointments(doctorId, currentDoctor?.name, (appts) => {
      setAppointments(appts);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [doctorId, currentDoctor]);

  // Helper date parsing for today & upcoming checks
  const todayISO = new Date().toISOString().split("T")[0];
  const todayFormatted = formatDateDisplay(todayISO);

  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const formatted = formatDateDisplay(dateStr);
    return dateStr === todayISO || formatted === todayFormatted;
  };

  const isUpcoming = (dateStr, status) => {
    if (status === "Cancelled" || status === "Completed") return false;
    if (!dateStr) return true;
    const formatted = formatDateDisplay(dateStr);
    if (dateStr === todayISO || formatted === todayFormatted) return true;
    
    // Check if future
    const isoMatch = dateStr.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (isoMatch) {
      return dateStr >= todayISO;
    }
    const ddmmyyyyMatch = dateStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (ddmmyyyyMatch) {
      const parts = dateStr.split("-");
      const rev = `${parts[2]}-${parts[1]}-${parts[0]}`;
      return rev >= todayISO;
    }
    return true;
  };

  // Categorized appointments
  const todayAppointments = useMemo(() => {
    return appointments.filter(a => isToday(a.date));
  }, [appointments, todayISO]);

  const upcomingAppointments = useMemo(() => {
    return appointments.filter(a => isUpcoming(a.date, a.bookingStatus || a.status));
  }, [appointments, todayISO]);

  const completedAppointments = useMemo(() => {
    return appointments.filter(a => (a.bookingStatus === "Completed" || a.status === "Completed"));
  }, [appointments]);

  const cancelledAppointments = useMemo(() => {
    return appointments.filter(a => (a.bookingStatus === "Cancelled" || a.status === "Cancelled"));
  }, [appointments]);

  const totalAppointments = appointments;

  // Filtered list based on active tab
  const displayedAppointments = useMemo(() => {
    switch (activeTab) {
      case "upcoming":
        return upcomingAppointments;
      case "today":
        return todayAppointments;
      case "completed":
        return completedAppointments;
      case "cancelled":
        return cancelledAppointments;
      case "all":
      default:
        return totalAppointments;
    }
  }, [activeTab, upcomingAppointments, todayAppointments, completedAppointments, cancelledAppointments, totalAppointments]);

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

  const openCancelModal = (appt) => {
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
        formatDoctorName(currentDoctor?.name || userProfile?.name || currentUser?.displayName)
      );

      setActionSuccessMessage(`Appointment with ${cancelModalAppt.patientName} has been cancelled. Patient and reception have been notified.`);
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

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-xl text-medical-primary animate-pulse font-medium">Loading Doctor Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header showing logged-in doctor's details strictly without Switch Doctor */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
        <p className="mt-1 text-gray-600 text-sm">
          Active Doctor: <span className="font-semibold text-medical-primary">{formatDoctorName(currentDoctor?.name || userProfile?.name || currentUser?.displayName)}</span> • <span className="text-gray-700">{currentDoctor?.department}</span> • <span className="text-gray-500">{currentDoctor?.location}</span>
        </p>
      </div>

      {/* Success and Error Notification Banners */}
      {actionSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{actionSuccessMessage}</span>
          </div>
          <button onClick={() => setActionSuccessMessage("")} className="text-emerald-600 hover:text-emerald-800">
            <X size={18} />
          </button>
        </div>
      )}

      {actionErrorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span className="font-medium">{actionErrorMessage}</span>
          </div>
          <button onClick={() => setActionErrorMessage("")} className="text-red-600 hover:text-red-800">
            <X size={18} />
          </button>
        </div>
      )}

      {/* 5 Required Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div 
          onClick={() => setActiveTab("today")}
          className={`p-5 rounded-xl border transition-all cursor-pointer ${activeTab === 'today' ? 'bg-teal-50 border-teal-300 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200'}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Today's</span>
            <Activity className="w-5 h-5 text-medical-primary" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{todayAppointments.length}</p>
          <p className="text-xs text-gray-500 mt-1">Appointments</p>
        </div>

        <div 
          onClick={() => setActiveTab("upcoming")}
          className={`p-5 rounded-xl border transition-all cursor-pointer ${activeTab === 'upcoming' ? 'bg-blue-50 border-blue-300 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200'}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Upcoming</span>
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</p>
          <p className="text-xs text-gray-500 mt-1">Scheduled</p>
        </div>

        <div 
          onClick={() => setActiveTab("completed")}
          className={`p-5 rounded-xl border transition-all cursor-pointer ${activeTab === 'completed' ? 'bg-green-50 border-green-300 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200'}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{completedAppointments.length}</p>
          <p className="text-xs text-gray-500 mt-1">Consulted</p>
        </div>

        <div 
          onClick={() => setActiveTab("cancelled")}
          className={`p-5 rounded-xl border transition-all cursor-pointer ${activeTab === 'cancelled' ? 'bg-red-50 border-red-300 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200'}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cancelled</span>
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{cancelledAppointments.length}</p>
          <p className="text-xs text-gray-500 mt-1">Cancelled</p>
        </div>

        <div 
          onClick={() => setActiveTab("all")}
          className={`p-5 rounded-xl border transition-all cursor-pointer ${activeTab === 'all' ? 'bg-purple-50 border-purple-300 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200'}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</span>
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalAppointments.length}</p>
          <p className="text-xs text-gray-500 mt-1">All Bookings</p>
        </div>
      </div>

      {/* Featured Upcoming Appointment Card (with complete & cancel action buttons) */}
      {upcomingAppointments.length > 0 && (
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-teal-100 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-medical-primary" />
              <h2 className="text-lg font-bold text-gray-900">Next Upcoming Appointment</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full uppercase tracking-wider">
                {upcomingAppointments[0].bookingStatus || upcomingAppointments[0].status || "Confirmed"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500 font-medium">Patient</p>
              <p className="text-base font-bold text-gray-900 mt-0.5">{upcomingAppointments[0].patientName}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Department</p>
              <p className="text-base font-bold text-gray-900 mt-0.5">{upcomingAppointments[0].department || currentDoctor?.department}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Location</p>
              <p className="text-base font-bold text-gray-900 mt-0.5">{upcomingAppointments[0].location || currentDoctor?.location}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Date & Time</p>
              <p className="text-base font-bold text-medical-primary mt-0.5">
                {formatDateDisplay(upcomingAppointments[0].date)} at {upcomingAppointments[0].timeSlot}
              </p>
            </div>
          </div>

          {upcomingAppointments[0].reason && (
            <div className="mt-4 pt-3 border-t border-teal-100 text-sm text-gray-700">
              <span className="font-semibold text-gray-900">Reason for visit:</span> {upcomingAppointments[0].reason}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-teal-100 flex flex-wrap gap-2 justify-end">
            <button
              onClick={() => openCompleteModal(upcomingAppointments[0])}
              className="px-3.5 py-1.5 bg-medical-primary hover:bg-medical-dark text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <FileText size={14} /> Add Notes & Complete
            </button>
            <button
              onClick={() => openCancelModal(upcomingAppointments[0])}
              className="px-3.5 py-1.5 bg-white hover:bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <XCircle size={14} /> Cancel Appointment
            </button>
          </div>
        </div>
      )}

      {/* Appointments List Section with Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-medical-primary" />
            <h2 className="text-xl font-bold text-gray-900">Appointments Schedule</h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-md transition-colors ${activeTab === 'all' ? 'bg-white text-gray-900 shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'}`}
            >
              All ({totalAppointments.length})
            </button>
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-3 py-1.5 rounded-md transition-colors ${activeTab === 'upcoming' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Upcoming ({upcomingAppointments.length})
            </button>
            <button
              onClick={() => setActiveTab("today")}
              className={`px-3 py-1.5 rounded-md transition-colors ${activeTab === 'today' ? 'bg-white text-teal-600 shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Today ({todayAppointments.length})
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-3 py-1.5 rounded-md transition-colors ${activeTab === 'completed' ? 'bg-white text-green-600 shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Completed ({completedAppointments.length})
            </button>
            <button
              onClick={() => setActiveTab("cancelled")}
              className={`px-3 py-1.5 rounded-md transition-colors ${activeTab === 'cancelled' ? 'bg-white text-red-600 shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Cancelled ({cancelledAppointments.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {displayedAppointments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-base font-medium text-gray-700">No {activeTab} appointments found for {formatDoctorName(currentDoctor?.name)}.</p>
              <p className="text-sm text-gray-400 mt-1">Appointments booked by patients for this doctor will appear here automatically.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedAppointments.map((appt) => {
                const status = appt.bookingStatus || appt.status || "Confirmed";
                const isCancellable = status !== 'Cancelled' && status !== 'Completed';

                return (
                  <div 
                    key={appt.id || appt.bookingId} 
                    className="border border-gray-100 rounded-xl p-5 bg-gray-50 hover:bg-white hover:border-gray-200 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-gray-900 text-lg">{appt.patientName}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                          status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                          status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1 font-medium text-medical-primary">
                          <Calendar size={14} /> {formatDateDisplay(appt.date)}
                        </div>
                        <div className="flex items-center gap-1 font-medium">
                          <Clock size={14} /> {appt.timeSlot}
                        </div>
                        <div className="flex items-center gap-1">
                          <Stethoscope size={14} /> {appt.department || currentDoctor?.department}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={14} /> {appt.location || currentDoctor?.location}
                        </div>
                      </div>

                      {appt.reason && (
                        <p className="text-xs text-gray-500 pt-1">
                          <span className="font-medium text-gray-700">Reason:</span> {appt.reason}
                        </p>
                      )}

                      {appt.notes && (
                        <div className="mt-2 bg-blue-50 p-2.5 rounded-md text-xs border border-blue-100 text-blue-900">
                          <span className="font-semibold flex items-center gap-1"><FileText size={12} /> Notes:</span>
                          <p className="mt-0.5 text-blue-800">{appt.notes}</p>
                        </div>
                      )}

                      {status === 'Cancelled' && appt.cancelReason && (
                        <div className="mt-2 bg-red-50 p-2.5 rounded-md text-xs border border-red-100 text-red-900">
                          <span className="font-semibold flex items-center gap-1 text-red-800">
                            <XCircle size={12} /> Cancelled {appt.cancelledBy ? `by ${appt.cancelledBy}` : ''}:
                          </span>
                          <p className="mt-0.5 text-red-700">{appt.cancelReason}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                      {isCancellable && (
                        <>
                          <button
                            onClick={() => openCompleteModal(appt)}
                            className="px-3 py-1.5 bg-medical-primary hover:bg-medical-dark text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors shadow-sm"
                          >
                            <FileText size={14} /> Add Notes & Complete
                          </button>
                          <button
                            onClick={() => openCancelModal(appt)}
                            className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors shadow-xs"
                          >
                            <XCircle size={14} /> Cancel Appointment
                          </button>
                        </>
                      )}
                      {status === 'Completed' && (
                        <span className="text-xs text-gray-500 flex items-center gap-1 py-1">
                          <CheckCircle size={14} className="text-emerald-600" /> Completed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-start justify-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">My Full Appointments</h2>
          <p className="text-gray-600 text-sm mb-5">View complete consultation details, filter, and review completed medical histories.</p>
          <Link to="/doctor/appointments" className="text-medical-primary font-semibold flex items-center gap-2 hover:underline text-sm">
            Go to My Appointments <ArrowRight size={16} />
          </Link>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-start justify-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Patient Directory</h2>
          <p className="text-gray-600 text-sm mb-5">Access your registered patient directory, contact info, and medical profiles.</p>
          <Link to="/doctor/patients" className="text-medical-primary font-semibold flex items-center gap-2 hover:underline text-sm">
            Go to My Patients <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Consultation Complete Modal */}
      {activeAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Consultation Notes</h3>
              <button onClick={() => setActiveAppointment(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-lg text-sm space-y-1 border border-gray-200">
                <p><strong>Patient:</strong> {activeAppointment.patientName}</p>
                <p><strong>Date & Time:</strong> {formatDateDisplay(activeAppointment.date)} at {activeAppointment.timeSlot}</p>
                <p><strong>Department:</strong> {activeAppointment.department || currentDoctor?.department}</p>
                <p><strong>Location:</strong> {activeAppointment.location || currentDoctor?.location}</p>
                {activeAppointment.reason && <p><strong>Symptoms:</strong> {activeAppointment.reason}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis & Remarks</label>
                <textarea 
                  className="w-full p-3 border rounded-lg focus:ring-medical-primary min-h-[120px] text-sm" 
                  placeholder="Enter consultation notes, diagnosis, prescription..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  onClick={() => setActiveAppointment(null)} 
                  className="flex-1 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleComplete} 
                  disabled={completing || !notes.trim()} 
                  className="flex-1 bg-medical-primary text-white py-2 rounded-lg hover:bg-medical-dark text-sm font-medium disabled:opacity-50"
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
