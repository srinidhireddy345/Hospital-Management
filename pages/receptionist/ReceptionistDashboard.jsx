import { useState, useEffect, useMemo } from "react";
import { 
  getAppointmentsByDoctor, 
  subscribeToDoctorAppointments, 
  updateAppointmentStatus, 
  rescheduleAppointment,
  cancelAppointmentByReceptionist,
  confirmAppointmentByReceptionist,
  sendAppointmentReminder
} from "../../services/appointmentService";
import { createNotification } from "../../services/notificationService";
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
  UserCheck, 
  CheckCircle, 
  CalendarClock, 
  Search,
  Building2,
  Users,
  Bell
} from "lucide-react";
import { Link } from "react-router-dom";
import DOCTORS, { 
  formatDoctorName, 
  formatDateDisplay, 
  getDoctorById, 
  isDoctorAvailable 
} from "../../data/doctors";

export default function ReceptionistDashboard() {
  const { currentUser, userRole } = useAuth();

  // Selected doctor ID from centralized database (Receptionist can switch doctor anytime)
  const [selectedDoctorId, setSelectedDoctorId] = useState(() => {
    try {
      const saved = localStorage.getItem("mediconnect_receptionist_doctor_id");
      if (saved && DOCTORS.some(d => d.doctorId === saved)) return saved;
    } catch {
      // ignore
    }
    return "doc-01"; // Default to Dr. Arjun Mehta
  });

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // all, upcoming, today, completed, cancelled
  const [searchTerm, setSearchTerm] = useState("");

  // Reschedule modal state
  const [rescheduleAppt, setRescheduleAppt] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [rescheduling, setRescheduling] = useState(false);
  const [slotMessage, setSlotMessage] = useState("");

  // Get active doctor details from centralized database
  const selectedDoctor = useMemo(() => {
    return getDoctorById(selectedDoctorId) || DOCTORS[0];
  }, [selectedDoctorId]);

  // Handle switching doctor (receptionist role stays unchanged)
  const handleDoctorChange = (newDocId) => {
    setSelectedDoctorId(newDocId);
    try {
      localStorage.setItem("mediconnect_receptionist_doctor_id", newDocId);
    } catch {
      // ignore
    }
  };

  // Subscribe to real-time appointment updates belonging strictly to the selected doctor's doctorId
  // Uses the exact same appointment records created when patients book appointments
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToDoctorAppointments(selectedDoctorId, selectedDoctor?.name, (appts) => {
      setAppointments(appts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedDoctorId, selectedDoctor]);

  // Date helper functions
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

  // 5 Required Appointment Categorized Counts for Selected Doctor
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

  // Filtered appointments list by active tab and search query
  const displayedAppointments = useMemo(() => {
    let list = totalAppointments;
    if (activeTab === "upcoming") list = upcomingAppointments;
    else if (activeTab === "today") list = todayAppointments;
    else if (activeTab === "completed") list = completedAppointments;
    else if (activeTab === "cancelled") list = cancelledAppointments;

    if (!searchTerm.trim()) return list;

    const query = searchTerm.toLowerCase();
    return list.filter(a => 
      (a.patientName && a.patientName.toLowerCase().includes(query)) ||
      (a.bookingId && a.bookingId.toLowerCase().includes(query)) ||
      (a.reason && a.reason.toLowerCase().includes(query)) ||
      (a.timeSlot && a.timeSlot.toLowerCase().includes(query))
    );
  }, [activeTab, totalAppointments, upcomingAppointments, todayAppointments, completedAppointments, cancelledAppointments, searchTerm]);

  // Receptionist actions: Confirm appointment
  const handleConfirmAppointment = async (appt) => {
    try {
      await confirmAppointmentByReceptionist(appt.id);
    } catch (err) {
      console.error("Error confirming appointment:", err);
      alert("Failed to confirm appointment: " + (err.message || "Unknown error"));
    }
  };

  // Receptionist actions: Cancel appointment
  const handleCancelAppointment = async (appt) => {
    const reason = window.prompt(
      `Are you sure you want to cancel the appointment for ${appt.patientName}?\nPlease enter a cancellation reason:`,
      "Hospital schedule reorganization / clinic emergency"
    );
    if (reason === null) return; // user cancelled prompt

    try {
      await cancelAppointmentByReceptionist(appt.id, reason.trim() || "Cancelled by hospital reception");
    } catch (err) {
      console.error("Error cancelling appointment:", err);
      alert("Failed to cancel appointment: " + (err.message || "Unknown error"));
    }
  };

  // Receptionist actions: Send appointment reminder
  const handleSendReminder = async (appt) => {
    try {
      await sendAppointmentReminder(appt.id);
      alert(`Reminder sent successfully to ${appt.patientName} and Dr. ${formatDoctorName(appt.doctorName || selectedDoctor.name)}.`);
    } catch (err) {
      console.error("Error sending reminder:", err);
      alert("Failed to send reminder: " + (err.message || "Unknown error"));
    }
  };

  // Reschedule slot calculation for selected doctor
  useEffect(() => {
    if (rescheduleAppt && newDate) {
      calculateAvailableSlots(selectedDoctorId, newDate);
    } else {
      setAvailableSlots([]);
      setSlotMessage("");
    }
  }, [rescheduleAppt, newDate, selectedDoctorId]);

  const calculateAvailableSlots = (docId, date) => {
    setSlotMessage("");
    setNewTime("");

    // Check busy days
    if (!isDoctorAvailable(docId, date)) {
      setAvailableSlots([]);
      setSlotMessage("Doctor is not available on this date according to their regular schedule.");
      return;
    }

    // Standard 30-minute slots 09:00 AM - 05:00 PM
    const allSlots = selectedDoctor?.availableTimeSlots || [
      "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
      "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
      "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
      "04:00 PM", "04:30 PM"
    ];

    // Exclude already booked slots for this doctor on this date
    const booked = appointments
      .filter(a => a.date === date && (a.status === 'Confirmed' || a.status === 'Pending') && a.id !== rescheduleAppt?.id)
      .map(a => a.timeSlot);

    const freeSlots = allSlots.filter(s => !booked.includes(s));
    setAvailableSlots(freeSlots);

    if (freeSlots.length === 0) {
      setSlotMessage("All time slots are booked for this date.");
    }
  };

  const handleExecuteReschedule = async () => {
    if (!newDate || !newTime || !rescheduleAppt) return;
    setRescheduling(true);
    try {
      await rescheduleAppointment(rescheduleAppt.id, selectedDoctorId, newDate, newTime);
      
      // Notify Patient
      if (rescheduleAppt.patientId) {
        await createNotification(
          rescheduleAppt.patientId,
          `Your appointment with ${formatDoctorName(selectedDoctor.name)} has been rescheduled to ${formatDateDisplay(newDate)} at ${newTime}.`
        );
      }

      setRescheduleAppt(null);
      setNewDate("");
      setNewTime("");
    } catch (err) {
      console.error("Reschedule failed:", err);
      alert("Failed to reschedule: " + (err.message || "Unknown error"));
    } finally {
      setRescheduling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-xl text-medical-primary animate-pulse font-medium">
          Loading Receptionist Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header with Switch Doctor Dropdown */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Receptionist Dashboard</h1>
            <span className="px-2.5 py-0.5 bg-teal-100 text-medical-primary text-xs font-semibold rounded-full flex items-center gap-1">
              <Building2 size={12} /> Front Desk Console
            </span>
          </div>
          <p className="mt-1 text-gray-600 text-sm">
            Active Doctor: <span className="font-semibold text-medical-primary">{formatDoctorName(selectedDoctor?.name)}</span> • <span className="text-gray-700">{selectedDoctor?.department}</span> • <span className="text-gray-500">{selectedDoctor?.location}</span>
          </p>
        </div>

        {/* Centralized Doctor Switcher for Receptionist */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap flex items-center gap-1.5">
            <UserCheck size={16} className="text-medical-primary" /> Switch Doctor:
          </label>
          <select
            value={selectedDoctorId}
            onChange={(e) => handleDoctorChange(e.target.value)}
            className="w-full md:w-80 p-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-medical-primary focus:border-medical-primary font-medium"
          >
            {DOCTORS.map(doc => (
              <option key={doc.doctorId} value={doc.doctorId}>
                {doc.name} ({doc.department} - {doc.location})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 5 Stats Cards for the Selected Doctor */}
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

      {/* Next Upcoming Appointment Preview for Selected Doctor */}
      {upcomingAppointments.length > 0 && (
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-teal-100 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-medical-primary" />
              <h2 className="text-lg font-bold text-gray-900">Next Upcoming Appointment for {formatDoctorName(selectedDoctor?.name)}</h2>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full uppercase tracking-wider">
              {upcomingAppointments[0].bookingStatus || upcomingAppointments[0].status || "Confirmed"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500 font-medium">Patient</p>
              <p className="text-base font-bold text-gray-900 mt-0.5">{upcomingAppointments[0].patientName}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Department</p>
              <p className="text-base font-bold text-gray-900 mt-0.5">{upcomingAppointments[0].department || selectedDoctor?.department}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Location</p>
              <p className="text-base font-bold text-gray-900 mt-0.5">{upcomingAppointments[0].location || selectedDoctor?.location}</p>
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
        </div>
      )}

      {/* Appointment Schedule & Management Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-medical-primary" />
              <h2 className="text-xl font-bold text-gray-900">
                {formatDoctorName(selectedDoctor?.name)}'s Schedule
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Live booking stream for {selectedDoctor?.department} • {selectedDoctor?.location}
            </p>
          </div>

          {/* Filter Tabs & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search patient, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-medical-primary w-full sm:w-48 bg-gray-50"
              />
            </div>

            <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg text-xs font-medium">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-2.5 py-1 rounded-md transition-colors ${activeTab === 'all' ? 'bg-white text-gray-900 shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'}`}
              >
                All ({totalAppointments.length})
              </button>
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`px-2.5 py-1 rounded-md transition-colors ${activeTab === 'upcoming' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Upcoming ({upcomingAppointments.length})
              </button>
              <button
                onClick={() => setActiveTab("today")}
                className={`px-2.5 py-1 rounded-md transition-colors ${activeTab === 'today' ? 'bg-white text-teal-600 shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Today ({todayAppointments.length})
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`px-2.5 py-1 rounded-md transition-colors ${activeTab === 'completed' ? 'bg-white text-green-600 shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Done ({completedAppointments.length})
              </button>
              <button
                onClick={() => setActiveTab("cancelled")}
                className={`px-2.5 py-1 rounded-md transition-colors ${activeTab === 'cancelled' ? 'bg-white text-red-600 shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Cancelled ({cancelledAppointments.length})
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {displayedAppointments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-base font-medium text-gray-700">No {activeTab} appointments found for {formatDoctorName(selectedDoctor?.name)}.</p>
              <p className="text-sm text-gray-400 mt-1">Appointments booked by patients for this doctor appear here automatically in real time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedAppointments.map((appt) => {
                const status = appt.bookingStatus || appt.status || "Confirmed";
                return (
                  <div 
                    key={appt.id || appt.bookingId} 
                    className="border border-gray-100 rounded-xl p-5 bg-gray-50 hover:bg-white hover:border-gray-200 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
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
                        {appt.bookingId && (
                          <span className="text-xs font-mono text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-200">
                            {appt.bookingId}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1 font-medium text-medical-primary">
                          <Calendar size={14} /> {formatDateDisplay(appt.date)}
                        </div>
                        <div className="flex items-center gap-1 font-medium">
                          <Clock size={14} /> {appt.timeSlot}
                        </div>
                        <div className="flex items-center gap-1">
                          <Stethoscope size={14} /> {appt.department || selectedDoctor?.department}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={14} /> {appt.location || selectedDoctor?.location}
                        </div>
                      </div>

                      {appt.reason && (
                        <p className="text-xs text-gray-500 pt-1">
                          <span className="font-medium text-gray-700">Reason:</span> {appt.reason}
                        </p>
                      )}

                      {status === 'Cancelled' && (appt.cancelReason || appt.cancelledBy) && (
                        <div className="mt-2 bg-red-50 p-2.5 rounded-md text-xs border border-red-100 text-red-900">
                          <span className="font-semibold flex items-center gap-1 text-red-800">
                            <XCircle size={12} /> Cancelled {appt.cancelledBy ? `by ${appt.cancelledBy}` : ''}:
                          </span>
                          <p className="mt-0.5 text-red-700">{appt.cancelReason || 'Cancelled'}</p>
                        </div>
                      )}
                    </div>

                    {/* Receptionist Management Controls */}
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                      {status === "Pending" && (
                        <button
                          onClick={() => handleConfirmAppointment(appt)}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors shadow-sm"
                          title="Confirm Appointment"
                        >
                          <CheckCircle size={14} /> Confirm
                        </button>
                      )}

                      {status === "Confirmed" && (
                        <button
                          onClick={() => handleSendReminder(appt)}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors shadow-xs"
                          title="Send Reminder to Patient & Doctor"
                        >
                          <Bell size={14} /> Reminder
                        </button>
                      )}

                      {(status === "Confirmed" || status === "Pending") && (
                        <button
                          onClick={() => {
                            setRescheduleAppt(appt);
                            setNewDate(appt.date || "");
                            setNewTime("");
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors shadow-sm"
                          title="Reschedule Appointment"
                        >
                          <CalendarClock size={14} /> Reschedule
                        </button>
                      )}

                      {(status === "Confirmed" || status === "Pending") && (
                        <button
                          onClick={() => handleCancelAppointment(appt)}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors shadow-xs"
                          title="Cancel Appointment"
                        >
                          <XCircle size={14} /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Central Hospital Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link 
          to="/receptionist/appointments"
          className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-teal-300 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Hospital Bookings</span>
            <Calendar className="w-5 h-5 text-medical-primary group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-base font-bold text-gray-900">Manage All Appointments</p>
          <p className="text-xs text-gray-500 mt-1">Cross-department patient bookings & status</p>
        </Link>

        <Link 
          to="/receptionist/availability"
          className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-teal-300 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Schedules</span>
            <Clock className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-base font-bold text-gray-900">Doctor Availability</p>
          <p className="text-xs text-gray-500 mt-1">Manage weekly shifts & busy slots</p>
        </Link>

        <Link 
          to="/receptionist/doctors"
          className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-teal-300 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Staff Directory</span>
            <Users className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-base font-bold text-gray-900">Hospital Doctors</p>
          <p className="text-xs text-gray-500 mt-1">60 specialists across 8 locations</p>
        </Link>

        <Link 
          to="/receptionist/health-packages"
          className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-teal-300 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Wellness</span>
            <Activity className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-base font-bold text-gray-900">Health Packages</p>
          <p className="text-xs text-gray-500 mt-1">Checkups & preventive healthcare</p>
        </Link>
      </div>

      {/* Reschedule Modal */}
      {rescheduleAppt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Reschedule Appointment</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Doctor: {formatDoctorName(selectedDoctor.name)} ({selectedDoctor.department})
                </p>
              </div>
              <button 
                onClick={() => setRescheduleAppt(null)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-lg text-sm space-y-1 border border-gray-200">
                <p><strong>Patient:</strong> {rescheduleAppt.patientName}</p>
                <p><strong>Current Slot:</strong> {formatDateDisplay(rescheduleAppt.date)} at {rescheduleAppt.timeSlot}</p>
                {rescheduleAppt.reason && <p><strong>Reason:</strong> {rescheduleAppt.reason}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Appointment Date</label>
                <input
                  type="date"
                  min={todayISO}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full p-2.5 border rounded-lg focus:ring-medical-primary text-sm bg-white"
                />
              </div>

              {slotMessage && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                  {slotMessage}
                </div>
              )}

              {availableSlots.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select New Time Slot</label>
                  <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
                    {availableSlots.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setNewTime(slot)}
                        className={`p-2 rounded-lg text-xs font-semibold border transition-all ${
                          newTime === slot 
                            ? "bg-medical-primary text-white border-medical-primary shadow-sm" 
                            : "bg-white text-gray-700 border-gray-200 hover:border-medical-primary"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setRescheduleAppt(null)}
                  className="flex-1 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteReschedule}
                  disabled={rescheduling || !newDate || !newTime}
                  className="flex-1 bg-medical-primary text-white py-2 rounded-lg hover:bg-medical-dark text-sm font-medium disabled:opacity-50"
                >
                  {rescheduling ? "Updating..." : "Confirm Reschedule"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
