import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getDoctors } from "../../services/userService";
import { formatDoctorName, getDoctorBusyDayNames } from "../../data/doctors";
import { getAllAvailability } from "../../services/availabilityService";
import { User, MapPin, Stethoscope, Clock, Calendar, Star, ArrowLeft } from "lucide-react";

export default function DoctorProfile() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctorData();
  }, [id]);

  const fetchDoctorData = async () => {
    setLoading(true);
    try {
      const docs = await getDoctors();
      const found = docs.find(d => d.doctorId === id || d.id === id);
      setDoctor(found || null);

      if (found) {
        try {
          const allAvail = await getAllAvailability();
          const today = new Date().toISOString().split("T")[0];
          const docAvail = allAvail.filter(a => (a.doctorId === id || a.doctorId === found.doctorId) && a.date >= today);
          docAvail.sort((a,b) => new Date(a.date) - new Date(b.date));
          setAvailabilities(docAvail);
        } catch {
          setAvailabilities([]);
        }
      }
    } catch (error) {
      console.error("Error fetching doctor:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-xl text-medical-primary animate-pulse">Loading profile...</div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800">Doctor not found</h2>
        <Link to="/patient/doctors" className="text-medical-primary hover:underline mt-4 inline-block">Back to Search</Link>
      </div>
    );
  }

  const busyDays = getDoctorBusyDayNames(doctor.doctorId || doctor.id);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link to="/patient/doctors" className="text-gray-500 hover:text-gray-800 flex items-center gap-1 font-medium w-fit">
        <ArrowLeft size={16} /> Back to Search
      </Link>

      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-start">
        <div className="w-32 h-32 md:w-40 md:h-40 bg-medical-primary/10 text-medical-primary rounded-full flex items-center justify-center text-5xl font-bold flex-shrink-0">
          {(doctor.name || "D").replace(/^(dr\.?\s*)+/i, "").charAt(0)}
        </div>
        
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{formatDoctorName(doctor.name)}</h1>
            <p className="text-medical-primary font-medium text-lg flex items-center gap-2 mt-1">
              <Stethoscope size={18} /> {doctor.department || doctor.specialization}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-gray-400" />
              <span>{doctor.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={18} className="text-gray-400" />
              <span>{doctor.experience || "10+ Years Experience"}</span>
            </div>
            <div className="flex items-center gap-2 text-yellow-500 font-medium">
              <Star size={18} className="fill-current" />
              <span>{doctor.rating || 4.8} / 5.0 (Certified Specialist)</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h3 className="font-bold text-gray-900 mb-2">About</h3>
            <p className="text-gray-600 leading-relaxed">
              {doctor.about || `${formatDoctorName(doctor.name)} is an expert in ${doctor.department || "General Medicine"} dedicated to patient wellness and advanced healthcare.`}
            </p>
          </div>
        </div>
        
        <div className="w-full md:w-auto flex flex-col gap-3">
          <Link 
            to={`/patient/book-appointment?doctorId=${doctor.doctorId || doctor.id}&department=${encodeURIComponent(doctor.department)}&location=${encodeURIComponent(doctor.location)}`} 
            className="w-full md:w-48 text-center py-3 bg-medical-primary text-white rounded-lg hover:bg-medical-dark transition-colors font-bold shadow-md"
          >
            Book Appointment
          </Link>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
          <Calendar className="text-medical-primary w-6 h-6" /> Consultation Schedule & Slots
        </h3>
        
        <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-gray-900">Standard Consultation Days:</span> Available 5 days a week 
            {busyDays.length > 0 && <span className="text-gray-500"> (Off on: {busyDays.join(", ")})</span>}.
          </p>
          <p className="text-sm text-gray-700 mt-2">
            <span className="font-semibold text-gray-900">Consultation Hours:</span> 09:00 AM - 05:00 PM (30 min slots)
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {(doctor.availableTimeSlots || ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"]).map(slot => (
              <span key={slot} className="px-3 py-1 bg-white border border-gray-200 text-gray-700 rounded text-xs font-medium">
                {slot}
              </span>
            ))}
          </div>
        </div>

        {availabilities.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-800 text-sm mb-3">Custom Hospital Shifts:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availabilities.map(av => (
                <div key={av.id} className="border border-gray-200 rounded-lg p-4 hover:border-medical-primary/50 hover:bg-gray-50 transition-colors">
                  <div className="font-bold text-gray-800 flex items-center gap-2 mb-2">
                    <Calendar size={16} className="text-medical-primary"/> 
                    {new Date(av.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <Clock size={16} className="text-gray-400"/>
                    {av.startTime} - {av.endTime}
                  </div>
                  <div className="text-xs text-gray-500 mt-2 bg-gray-100 w-fit px-2 py-1 rounded">
                    {av.duration} min slots
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
