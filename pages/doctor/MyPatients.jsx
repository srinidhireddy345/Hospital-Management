import { useState, useEffect } from "react";
import { getAppointmentsByDoctor } from "../../services/appointmentService";
import { getAllPatients } from "../../services/userService";
import { useAuth } from "../../context/AuthContext";
import { Users, Search, Mail, Phone, Calendar } from "lucide-react";
import { DOCTORS, formatDoctorName } from "../../data/doctors";

export default function MyPatients() {
  const { currentUser, userProfile } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
    return "doc-01";
  })();

  const currentDoctor = DOCTORS.find(d => d.doctorId === doctorId) || DOCTORS[0];

  useEffect(() => {
    fetchData();
  }, [doctorId, currentUser]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appts, allPats] = await Promise.all([
        getAppointmentsByDoctor(doctorId, currentDoctor?.name),
        getAllPatients().catch(() => [])
      ]);
      
      const patientMap = new Map();

      // First map all registered patients
      (allPats || []).forEach(p => {
        patientMap.set(p.id, {
          id: p.id,
          name: p.name || p.email?.split("@")[0] || "Patient",
          email: p.email || "",
          phone: p.phone || "No phone provided",
          appointmentCount: 0
        });
      });

      // Track appointments and include any patients who booked
      (appts || []).forEach(a => {
        const pId = a.patientId || `pat-${a.patientName}`;
        if (patientMap.has(pId)) {
          const pat = patientMap.get(pId);
          pat.appointmentCount = (pat.appointmentCount || 0) + 1;
          if (a.patientName && (!pat.name || pat.name === "Patient")) pat.name = a.patientName;
        } else {
          patientMap.set(pId, {
            id: pId,
            name: a.patientName || "Patient",
            email: a.patientEmail || "N/A",
            phone: a.patientPhone || "No phone provided",
            appointmentCount: 1
          });
        }
      });

      // Filter only patients who have booked with this doctor
      const activeDoctorPatients = Array.from(patientMap.values()).filter(p => p.appointmentCount > 0);
      setPatients(activeDoctorPatients);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => {
    return p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
           p.email?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-xl text-medical-primary animate-pulse">Loading patients...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-medical-primary" /> My Patients Directory
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">
            Patients for <span className="font-semibold text-medical-primary">{formatDoctorName(currentDoctor?.name)}</span> ({currentDoctor?.department} &bull; {currentDoctor?.location})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">

          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search patients..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-medical-primary w-full bg-white shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-600 font-medium">No patients found for this doctor</p>
              <p className="text-xs text-gray-400 mt-1">
                Patients who book appointments with {formatDoctorName(currentDoctor?.name)} will be listed here.
              </p>
            </div>
          ) : (
            filteredPatients.map(patient => (
              <div key={patient.id} className="border border-gray-100 p-4 rounded-lg flex items-start gap-4 bg-gray-50 hover:bg-white hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-medical-primary/10 text-medical-primary rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 mt-0.5">
                  {patient.name?.charAt(0) || "P"}
                </div>
                <div className="overflow-hidden flex-1">
                  <p className="font-bold text-gray-900 truncate">{patient.name}</p>
                  <p className="text-xs text-gray-500 truncate flex items-center gap-1.5 mt-1">
                    <Mail size={12} className="text-gray-400 flex-shrink-0" />
                    <span>{patient.email || "No email"}</span>
                  </p>
                  <p className="text-xs text-gray-500 truncate flex items-center gap-1.5 mt-0.5">
                    <Phone size={12} className="text-gray-400 flex-shrink-0" />
                    <span>{patient.phone}</span>
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Calendar size={12} className="text-medical-primary" /> Appointments:
                    </span>
                    <span className="font-semibold text-medical-primary bg-medical-primary/10 px-2 py-0.5 rounded-full">
                      {patient.appointmentCount}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
