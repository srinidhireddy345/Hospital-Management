import { useState, useEffect, useMemo } from "react";
import { Calendar } from "lucide-react";
import { getAppointmentsByDoctor } from "../../services/appointmentService";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  filterDoctors, 
  LOCATIONS, 
  DEPARTMENTS, 
  isDoctorAvailable, 
  formatDoctorName, 
  formatDateDisplay, 
  getDoctorById 
} from "../../data/doctors";
import { getYesterdayDateString, isPastDOB, DOB_ERROR_MESSAGE } from "../../utils/dobValidation";

export default function AppointmentBookingForm({ doctors, onBookingSuccess }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);

  const initialDoctorId = searchParams.get("doctorId") || "";
  const initialDoctor = initialDoctorId ? getDoctorById(initialDoctorId) : null;

  const [bookingData, setBookingData] = useState({
    name: currentUser?.displayName || "",
    email: currentUser?.email || "",
    phone: "",
    dob: "",
    department: initialDoctor?.department || searchParams.get("department") || "",
    location: initialDoctor?.location || searchParams.get("location") || "",
    doctorId: initialDoctorId,
    date: "",
    timeSlot: "",
    reason: "",
    paymentMethod: "UPI"
  });
  const [bookingMessage, setBookingMessage] = useState("");
  const [dobError, setDobError] = useState("");
  
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Dynamically filtered doctor list based on department + location
  const filteredDoctors = useMemo(() => {
    if (!bookingData.department || !bookingData.location) return [];
    return filterDoctors(bookingData.department, bookingData.location);
  }, [bookingData.department, bookingData.location]);

  useEffect(() => {
    if (bookingData.doctorId && bookingData.date) {
      fetchSlots();
    } else {
      setAvailableTimeSlots([]);
      setBookedSlots([]);
      setBookingMessage("");
    }
  }, [bookingData.doctorId, bookingData.date]);

  const fetchSlots = async () => {
    setLoadingSlots(true);
    setBookingMessage("");
    try {
      // 1. Check local busy-day availability for the selected date
      if (!isDoctorAvailable(bookingData.doctorId, bookingData.date)) {
        setAvailableTimeSlots([]);
        setBookedSlots([]);
        setBookingMessage("Doctor is not available on this date.");
        setLoadingSlots(false);
        return;
      }

      // 2. Doctor is available — generate 30-minute slots from 09:00 to 17:00
      const startHour = 9;
      const endHour = 17;
      const slotDuration = 30; // minutes
      const slots = [];
      let current = new Date(`1970-01-01T${String(startHour).padStart(2, '0')}:00:00`);
      const end = new Date(`1970-01-01T${String(endHour).padStart(2, '0')}:00:00`);

      while (current < end) {
        let h = current.getHours();
        let m = current.getMinutes();
        let ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        h = h ? h : 12;
        let hStr = h < 10 ? '0' + h : h;
        let mStr = m < 10 ? '0' + m : m;

        let next = new Date(current);
        next.setMinutes(next.getMinutes() + slotDuration);

        if (next <= end) {
          slots.push(`${hStr}:${mStr} ${ampm}`);
        }
        current = next;
      }

      setAvailableTimeSlots(slots);

      // 3. Fetch already-booked appointments for this doctor + date
      try {
        const appts = await getAppointmentsByDoctor(bookingData.doctorId);
        const dateAppts = appts.filter(a => a.date === bookingData.date && (a.status === 'Confirmed' || a.status === 'Pending' || a.bookingStatus === 'Confirmed' || a.bookingStatus === 'Pending'));
        setBookedSlots(dateAppts.map(a => a.timeSlot));
      } catch {
        setBookedSlots([]);
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    if (['department', 'location', 'doctorId', 'date'].includes(name)) {
      setBookingMessage("");
    }

    if (name === "dob") {
      if (value) {
        if (!isPastDOB(value)) {
          setDobError(DOB_ERROR_MESSAGE);
        } else {
          setDobError("");
        }
      } else {
        setDobError("");
      }
    }

    setBookingData(prev => {
      const newData = { ...prev, [name]: value };
      // Reset doctor when department or location changes
      if (name === 'department' || name === 'location') {
        newData.doctorId = "";
        newData.timeSlot = "";
      }
      // Reset time slot when doctor or date changes
      if (name === 'doctorId' || name === 'date') {
        newData.timeSlot = "";
      }
      return newData;
    });
  };

  const nextStep = () => {
    if (step === 1) {
      if (!bookingData.dob || !isPastDOB(bookingData.dob)) {
        setDobError(DOB_ERROR_MESSAGE);
        return;
      }
      setDobError("");
    }
    setStep(s => s + 1);
  };
  const prevStep = () => setStep(s => s - 1);

  // Look up selected doctor by ID
  const getSelectedDoctor = () => getDoctorById(bookingData.doctorId);

  const submitBooking = async () => {
    setBookingMessage("");
    try {
      const doctor = getSelectedDoctor();
      
      const itemDetails = {
        type: "appointment",
        name: `${formatDoctorName(doctor?.name)} (Consultation)`,
        price: "₹500",
        doctorId: doctor?.doctorId || doctor?.id || bookingData.doctorId
      };

      const completeBookingData = {
        patientId: currentUser.uid,
        patientName: bookingData.name || currentUser.displayName || currentUser.email,
        doctorId: doctor?.doctorId || doctor?.id || bookingData.doctorId,
        doctorName: formatDoctorName(doctor?.name || "Unknown"),
        department: doctor?.department || bookingData.department || "General",
        location: doctor?.location || bookingData.location || "",
        date: bookingData.date,
        formattedDate: formatDateDisplay(bookingData.date),
        timeSlot: bookingData.timeSlot,
        reason: bookingData.reason || "",
        preferredDate: bookingData.date,
        preferredTime: bookingData.timeSlot,
        bookingStatus: "Confirmed",
        status: "Confirmed"
      };

      navigate("/patient/payment", {
        state: {
          bookingData: completeBookingData,
          selectedPackage: itemDetails
        }
      });
      
      if (onBookingSuccess) {
        onBookingSuccess();
      }
    } catch (error) {
      console.error(error);
      setBookingMessage(error.message || "Error processing payment.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold mb-6 text-medical-dark flex items-center gap-2 border-b pb-4">
        <Calendar className="w-6 h-6 text-medical-primary" /> Book a New Appointment
      </h2>
      
      {bookingMessage && (
        <div className={`p-4 rounded-md mb-6 ${bookingMessage.includes("Error") || bookingMessage.includes("not available") || bookingMessage.includes("No doctors") ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {bookingMessage}
        </div>
      )}

      {/* Stepper */}
      <div className="flex items-center mb-8">
        <div className={`flex-1 text-center text-sm font-medium ${step >= 1 ? 'text-medical-primary' : 'text-gray-400'}`}>1. Details</div>
        <div className={`flex-1 text-center text-sm font-medium ${step >= 2 ? 'text-medical-primary' : 'text-gray-400'}`}>2. Schedule</div>
        <div className={`flex-1 text-center text-sm font-medium ${step >= 3 ? 'text-medical-primary' : 'text-gray-400'}`}>3. Confirm</div>
      </div>

      <div className="min-h-[250px]">
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" name="name" value={bookingData.name} onChange={handleBookingChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-medical-primary focus:border-medical-primary" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" name="email" value={bookingData.email} onChange={handleBookingChange} className="w-full border border-gray-300 rounded-md p-2 bg-gray-50" readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" name="phone" value={bookingData.phone} onChange={handleBookingChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-medical-primary focus:border-medical-primary" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input 
                  type="date" 
                  name="dob" 
                  max={getYesterdayDateString()}
                  value={bookingData.dob} 
                  onChange={handleBookingChange} 
                  className={`w-full border rounded-md p-2 focus:ring-medical-primary focus:border-medical-primary ${dobError ? "border-red-500" : "border-gray-300"}`} 
                  required 
                />
                {dobError && <p className="text-xs text-red-600 mt-1">{dobError}</p>}
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <button onClick={nextStep} disabled={!bookingData.name || !bookingData.phone || !bookingData.dob || !!dobError} className="bg-medical-primary text-white px-6 py-2 rounded-md hover:bg-medical-dark transition-colors disabled:opacity-50">Next Step</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select name="department" value={bookingData.department} onChange={handleBookingChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-medical-primary focus:border-medical-primary">
                  <option value="">-- Select Specialty --</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select name="location" value={bookingData.location} onChange={handleBookingChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-medical-primary focus:border-medical-primary">
                  <option value="">-- Select Location --</option>
                  {LOCATIONS.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                <select name="doctorId" value={bookingData.doctorId} onChange={handleBookingChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-medical-primary focus:border-medical-primary" required>
                  <option value="">-- Select Doctor --</option>
                  {filteredDoctors.map(doc => (
                    <option key={doc.doctorId || doc.id} value={doc.doctorId || doc.id}>
                      {formatDoctorName(doc.name)} ({doc.department})
                    </option>
                  ))}
                </select>
                {bookingData.department && bookingData.location && filteredDoctors.length === 0 && (
                  <p className="text-sm text-red-600 mt-1">No doctors available for this department and location.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" name="date" min={new Date().toISOString().split("T")[0]} value={bookingData.date} onChange={handleBookingChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-medical-primary focus:border-medical-primary" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot {loadingSlots && <span className="text-medical-primary text-xs">(Loading...)</span>}</label>
                <select name="timeSlot" value={bookingData.timeSlot} onChange={handleBookingChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-medical-primary focus:border-medical-primary" required disabled={!bookingData.date || !bookingData.doctorId || loadingSlots}>
                  <option value="">-- Select Time --</option>
                  {availableTimeSlots.map(slot => (
                    <option key={slot} value={slot} disabled={bookedSlots.includes(slot)}>
                      {slot} {bookedSlots.includes(slot) ? '(Booked)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="pt-4 flex justify-between">
              <button onClick={prevStep} className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2">Back</button>
              <button onClick={nextStep} disabled={!bookingData.doctorId || !bookingData.date || !bookingData.timeSlot} className="bg-medical-primary text-white px-6 py-2 rounded-md hover:bg-medical-dark transition-colors disabled:opacity-50">Next Step</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit / Symptoms</label>
              <textarea name="reason" value={bookingData.reason} onChange={handleBookingChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-medical-primary focus:border-medical-primary h-24" placeholder="Briefly describe your symptoms..."></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proceed to Payment</label>
              <p className="text-sm text-gray-500 mb-2">You will select your payment method on the next page.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-sm space-y-2">
              <p><strong>Doctor:</strong> {formatDoctorName(getSelectedDoctor()?.name)}</p>
              <p><strong>Department:</strong> {getSelectedDoctor()?.department || bookingData.department}</p>
              <p><strong>Location:</strong> {getSelectedDoctor()?.location || bookingData.location}</p>
              <p><strong>Date & Time:</strong> {formatDateDisplay(bookingData.date)} at {bookingData.timeSlot}</p>
              <p><strong>Patient:</strong> {bookingData.name}</p>
              <p><strong>Consultation Fee:</strong> ₹500</p>
            </div>
            <div className="pt-4 flex justify-between">
              <button onClick={prevStep} className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2">Back</button>
              <button onClick={submitBooking} className="bg-medical-dark text-white px-8 py-2 rounded-md hover:bg-teal-900 transition-colors font-bold">Proceed to Pay ₹500</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
