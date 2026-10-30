import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDoctors } from "../services/userService";
import { DEPARTMENTS, LOCATIONS, formatDoctorName } from "../data/doctors";
import { ArrowRight, Activity, Heart, Shield, Stethoscope, Phone, Clock, UserCircle, CheckCircle } from "lucide-react";
import { healthPackages } from "../data/packages";

export default function Home() {
  const { currentUser, userRole, loading } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [fetchingDocs, setFetchingDocs] = useState(true);
  const [showPackages, setShowPackages] = useState(false);

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const docs = await getDoctors();
        setDoctors(docs);
      } catch (err) {
        console.error("Failed to load doctors", err);
      } finally {
        setFetchingDocs(false);
      }
    }
    fetchDoctors();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-xl text-medical-primary font-semibold animate-pulse">Loading...</div>
      </div>
    );
  }

  // If already logged in, we could redirect, but let's allow them to see the home page 
  // since the prompt implies the home page is a public marketing page.
  // We'll let them click Dashboard on the navbar to go to their dashboard.

  const departments = [
    { name: "Cardiology", icon: <Heart className="w-8 h-8 text-medical-primary" />, desc: "Comprehensive heart care and cardiovascular treatments." },
    { name: "Neurology", icon: <Activity className="w-8 h-8 text-medical-primary" />, desc: "Expert care for neurological disorders and brain health." },
    { name: "Orthopedics", icon: <Activity className="w-8 h-8 text-medical-primary" />, desc: "Bone and joint treatments to keep you moving." },
    { name: "Pediatrics", icon: <Heart className="w-8 h-8 text-medical-primary" />, desc: "Compassionate care for infants, children, and adolescents." },
    { name: "Dermatology", icon: <Stethoscope className="w-8 h-8 text-medical-primary" />, desc: "Skin, hair, and nail care from top dermatologists." },
    { name: "General Medicine", icon: <Shield className="w-8 h-8 text-medical-primary" />, desc: "Primary healthcare and comprehensive wellness checkups." },
  ];

  const uniqueSpecialties = DEPARTMENTS;
  const uniqueLocations = LOCATIONS;

  const filteredDoctors = doctors.filter(d => {
    const searchClean = searchQuery.toLowerCase().replace(/^(dr\.?\s*)+/i, "").trim();
    const docClean = (d.name || "").toLowerCase().replace(/^(dr\.?\s*)+/i, "").trim();
    const docLoc = d.location || "";
    const matchesSearch = !searchClean || 
                          docClean.includes(searchClean) || 
                          d.department?.toLowerCase().includes(searchClean) || 
                          d.specialization?.toLowerCase().includes(searchClean) || 
                          docLoc.toLowerCase().includes(searchClean);
    
    const matchesSpecialty = filterSpecialty ? (d.department === filterSpecialty || d.specialty === filterSpecialty || d.specialization === filterSpecialty) : true;
    const matchesLocation = filterLocation ? docLoc === filterLocation : true;
    
    return matchesSearch && matchesSpecialty && matchesLocation;
  });

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-medical-green py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-5xl font-extrabold text-medical-dark leading-tight">
              Healthcare That <br/> Puts You First.
            </h1>
            <p className="text-lg text-gray-700 max-w-lg">
              Find the right specialist, book care in seconds, and stay connected with your health journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link 
                to={currentUser ? "/dashboard" : "/register"}
                className="bg-medical-primary hover:bg-medical-dark text-white px-8 py-3 rounded-md font-bold text-lg text-center transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                Book Appointment <ArrowRight size={20} />
              </Link>
              <a 
                href="#doctors"
                className="bg-white hover:bg-gray-50 text-medical-dark border border-medical-primary px-8 py-3 rounded-md font-bold text-lg text-center transition-colors flex items-center justify-center"
              >
                Find a Doctor
              </a>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-6 bg-white p-3 rounded-lg inline-block shadow-sm">
              <span className="flex items-center gap-1"><Phone size={16} className="text-medical-primary" /> +91 98765 43210</span>
              <span className="flex items-center gap-1"><Clock size={16} className="text-medical-primary" /> 24/7 Emergency</span>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            {/* Placeholder for hero image */}
            <div className="w-full max-w-md aspect-square bg-teal-100 rounded-full flex items-center justify-center shadow-xl border-8 border-white overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-medical-primary/20 to-transparent"></div>
              <Stethoscope className="w-32 h-32 text-medical-primary opacity-80" />
            </div>
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section id="departments" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Departments</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We provide a wide range of specialized medical services to cater to all your healthcare needs under one roof.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map((dept, idx) => (
              <div key={idx} className="bg-slate-50 rounded-xl p-8 hover:shadow-lg transition-shadow border border-gray-100 hover:border-medical-primary group">
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                  {dept.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{dept.name}</h3>
                <p className="text-gray-600 leading-relaxed">{dept.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctor Directory Section */}
      <section id="doctors" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Specialists</h2>
              <p className="text-gray-600 max-w-xl">Find the right doctor for your specific needs and book a consultation instantly.</p>
            </div>
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-56 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-medical-primary focus:border-medical-primary outline-none transition-all shadow-sm"
              />
              <select
                value={filterSpecialty}
                onChange={(e) => setFilterSpecialty(e.target.value)}
                className="w-full sm:w-48 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-medical-primary focus:border-medical-primary outline-none transition-all shadow-sm bg-white"
              >
                <option value="">Select Specialty</option>
                {uniqueSpecialties.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="w-full sm:w-48 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-medical-primary focus:border-medical-primary outline-none transition-all shadow-sm bg-white"
              >
                <option value="">Select Location</option>
                {uniqueLocations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          {fetchingDocs ? (
            <div className="text-center py-12 text-gray-500">Loading doctors...</div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-500 text-lg">No doctors found matching your search.</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-4 text-medical-primary hover:underline font-medium"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredDoctors.map(doctor => (
                <div key={doctor.doctorId || doctor.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col">
                  <div className="h-40 bg-medical-green flex items-center justify-center">
                    <UserCircle className="w-20 h-20 text-medical-primary opacity-50" />
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{formatDoctorName(doctor.name)}</h3>
                    <p className="text-medical-primary font-medium text-sm mb-3">{doctor.department || doctor.specialization}</p>
                    
                    <div className="mt-auto space-y-2 text-sm text-gray-600 mb-5">
                      <div className="flex items-center gap-2">
                        <Clock size={16} /> <span>{doctor.location}</span>
                      </div>
                      {doctor.rating && (
                        <div className="flex items-center gap-2 text-yellow-500">
                          ★ <span className="text-gray-600">{doctor.rating}/5 Rating</span>
                        </div>
                      )}
                    </div>
                    
                    <Link
                      to={currentUser ? `/patient/book-appointment?doctorId=${doctor.doctorId || doctor.id}&department=${encodeURIComponent(doctor.department)}&location=${encodeURIComponent(doctor.location)}` : `/login?redirect=${encodeURIComponent(`/patient/book-appointment?doctorId=${doctor.doctorId || doctor.id}`)}`}
                      className="block w-full py-2 text-center bg-slate-100 hover:bg-medical-primary hover:text-white text-medical-dark font-medium rounded-md transition-colors"
                    >
                      Book Appointment
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section id="health-checkup" className="py-20 px-4 sm:px-6 lg:px-8 bg-medical-dark text-white transition-all duration-500">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">Prioritize Your Health Today</h2>
          <p className="text-lg text-teal-100">
            Comprehensive health checkup packages tailored for every age group. Prevention is better than cure.
          </p>
          {!showPackages && (
            <button 
              onClick={() => setShowPackages(true)}
              className="inline-block bg-white text-medical-dark hover:bg-gray-100 px-8 py-3 rounded-md font-bold text-lg transition-colors shadow-lg cursor-pointer"
            >
              Explore Packages
            </button>
          )}
        </div>
        
        {showPackages && (
          <div className="max-w-7xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {healthPackages.map((pkg, idx) => (
              <div key={idx} className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 flex flex-col text-gray-900 relative transition-transform hover:-translate-y-1 hover:shadow-xl">
                {pkg.badge && (
                  <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                    {pkg.badge}
                  </div>
                )}
                <div className="p-6 bg-slate-50 border-b border-gray-100 flex flex-col items-center text-center">
                  <h3 className="text-xl font-bold text-medical-dark mb-2 min-h-[56px] flex items-center justify-center">{pkg.name}</h3>
                  <div className="text-3xl font-extrabold text-medical-primary mb-2">{pkg.price}</div>
                  <div className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    Best for: {pkg.bestFor}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-sm text-gray-600 italic mb-4 text-center border-b pb-4">"{pkg.keyBenefit}"</p>
                  <div className="flex-1">
                    <p className="font-semibold text-sm mb-3 text-medical-dark uppercase tracking-wider">Tests Included:</p>
                    <ul className="space-y-2 mb-6">
                      {pkg.tests.map((test, tIdx) => (
                        <li key={tIdx} className="text-sm text-gray-700 flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-medical-primary shrink-0 mt-0.5" />
                          <span>{test}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    to={currentUser ? (userRole === 'patient' ? `/patient/book-package?pkgIdx=${idx}` : "/dashboard") : `/login?redirect=${encodeURIComponent('/patient/book-package?pkgIdx=' + idx)}`}
                    className="block w-full py-3 text-center bg-medical-primary hover:bg-medical-dark text-white font-bold rounded-md transition-colors mt-auto"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
