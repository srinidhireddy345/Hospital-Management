import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getDoctors } from "../../services/userService";
import { DEPARTMENTS, LOCATIONS, formatDoctorName } from "../../data/doctors";
import { Search, MapPin, Stethoscope } from "lucide-react";

export default function SearchDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const docs = await getDoctors();
      setDoctors(docs);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doc => {
    const searchClean = searchTerm.toLowerCase().replace(/^(dr\.?\s*)+/i, "").trim();
    const docClean = (doc.name || "").toLowerCase().replace(/^(dr\.?\s*)+/i, "").trim();
    const matchName = !searchClean || docClean.includes(searchClean);
    const matchSpec = specialization === "" || 
      doc.department === specialization || 
      doc.specialization === specialization || 
      doc.specialty === specialization;
    const matchLoc = location === "" || doc.location === location;
    return matchName && matchSpec && matchLoc;
  });

  const specializations = DEPARTMENTS;
  const locations = LOCATIONS;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-xl text-medical-primary animate-pulse">Loading doctors...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Search className="w-6 h-6 text-medical-primary" /> Find a Doctor
      </h1>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by doctor name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-medical-primary"
          />
        </div>
        <div className="w-full md:w-48">
          <select 
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-medical-primary"
          >
            <option value="">All Specialties</option>
            {specializations.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="w-full md:w-48">
          <select 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-medical-primary"
          >
            <option value="">All Locations</option>
            {locations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
            No doctors found matching your criteria.
          </div>
        ) : (
          filteredDoctors.map(doctor => (
            <div key={doctor.doctorId || doctor.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-medical-primary/10 text-medical-primary rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">
                  {(doctor.name || "D").replace(/^(dr\.?\s*)+/i, "").charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{formatDoctorName(doctor.name)}</h3>
                  <p className="text-medical-primary font-medium text-sm flex items-center gap-1">
                    <Stethoscope size={14} /> {doctor.department || doctor.specialization}
                  </p>
                  <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                    <MapPin size={14} /> {doctor.location}
                  </p>
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-gray-100 flex gap-2">
                <Link to={`/patient/doctors/${doctor.doctorId || doctor.id}`} className="flex-1 text-center py-2 border border-medical-primary text-medical-primary rounded-lg hover:bg-medical-primary/5 transition-colors font-medium">
                  View Profile
                </Link>
                <Link to={`/patient/book-appointment?doctorId=${doctor.doctorId || doctor.id}&department=${encodeURIComponent(doctor.department)}&location=${encodeURIComponent(doctor.location)}`} className="flex-1 text-center py-2 bg-medical-primary text-white rounded-lg hover:bg-medical-dark transition-colors font-medium">
                  Book
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
