import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import { sanitizeName } from "../../utils/googleAuthHelper";
import { User, Stethoscope, Building2, CheckCircle2, ArrowRight } from "lucide-react";
import DOCTORS, { getDoctorById } from "../../data/doctors";

export default function SelectRole() {
  const { currentUser, userRole, setUserRole, setUserProfile, loading } = useAuth();
  const [selectedRole, setSelectedRole] = useState("patient");
  const [doctorProfileId, setDoctorProfileId] = useState("doc-01");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // If not logged in, redirect to login
  useEffect(() => {
    if (!loading && !currentUser) {
      navigate("/login", { replace: true });
    }
  }, [currentUser, loading, navigate]);

  // If user already has a role, redirect to their dashboard
  useEffect(() => {
    if (!loading && currentUser && userRole) {
      if (userRole === "doctor") {
        navigate("/doctor/dashboard", { replace: true });
      } else if (userRole === "receptionist" || userRole === "admin") {
        navigate("/receptionist/dashboard", { replace: true });
      } else {
        navigate("/patient/dashboard", { replace: true });
      }
    }
  }, [userRole, currentUser, loading, navigate]);

  const roles = [
    {
      id: "patient",
      title: "Patient",
      tagline: "Access Healthcare & Appointments",
      description: "Book specialist appointments, browse health packages, and manage your health records seamlessly.",
      icon: <User className="w-8 h-8 text-medical-primary" />,
      accentColor: "border-medical-primary bg-teal-50/50"
    },
    {
      id: "doctor",
      title: "Doctor",
      tagline: "Consultations & Clinical Practice",
      description: "Manage your daily appointment slots, consult patients, and access medical consultation histories.",
      icon: <Stethoscope className="w-8 h-8 text-medical-primary" />,
      accentColor: "border-medical-primary bg-teal-50/50"
    },
    {
      id: "receptionist",
      title: "Receptionist",
      tagline: "Hospital Front-Desk & Schedules",
      description: "Manage hospital walk-ins, doctor availability, patient check-ins, and hospital operations.",
      icon: <Building2 className="w-8 h-8 text-medical-primary" />,
      accentColor: "border-medical-primary bg-teal-50/50"
    }
  ];

  const handleConfirmRole = async () => {
    if (!currentUser) return;
    if (!selectedRole) {
      setError("Please select a role to continue.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const existingDoc = await getDoc(userDocRef);
      const existingData = existingDoc.exists() ? existingDoc.data() : {};

      const selectedDocObj = DOCTORS.find(d => d.doctorId === doctorProfileId) || DOCTORS[0];

      const cleanName = selectedRole === "doctor"
        ? (selectedDocObj.name || sanitizeName(currentUser.displayName))
        : (sanitizeName(currentUser.displayName) || 
           existingData.name || 
           currentUser.email?.split("@")[0] || 
           "User");

      const profileData = {
        ...existingData,
        uid: currentUser.uid,
        name: cleanName,
        email: currentUser.email,
        photoUrl: currentUser.photoURL || existingData.photoUrl || null,
        role: selectedRole,
        ...(selectedRole === "doctor" ? { 
          doctorId: selectedDocObj.doctorId,
          specialization: selectedDocObj.department,
          department: selectedDocObj.department,
          location: selectedDocObj.location 
        } : {}),
        updatedAt: new Date(),
        createdAt: existingData.createdAt || new Date()
      };

      // Save to Firestore users/{uid}
      await setDoc(userDocRef, profileData, { merge: true });

      // Update AuthContext state
      if (setUserRole) setUserRole(selectedRole);
      if (setUserProfile) setUserProfile({ id: currentUser.uid, ...profileData });

      console.log(`Role [${selectedRole}] assigned to user ${currentUser.email}`);

      // Redirect to correct dashboard based on selected role
      if (selectedRole === "doctor") {
        navigate("/doctor/dashboard", { replace: true });
      } else if (selectedRole === "receptionist") {
        navigate("/receptionist/dashboard", { replace: true });
      } else {
        navigate("/patient/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("Error saving selected role:", err);
      setError("Failed to save your role. " + (err.message || "Please try again."));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-xl text-medical-primary font-semibold animate-pulse">
          Loading MediConnect...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-12">
        <div className="text-center space-y-3 mb-10">
          <span className="inline-block px-3 py-1 bg-medical-green text-medical-dark text-xs font-bold rounded-full uppercase tracking-wider">
            Welcome to MediConnect
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-medical-dark tracking-tight">
            How would you like to use MediConnect?
          </h1>
          <p className="text-base text-gray-600 max-w-xl mx-auto">
            Choose your account role below. We will personalize your dashboard and access privileges accordingly.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {roles.map((r) => {
            const isSelected = selectedRole === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRole(r.id)}
                className={`relative text-left p-6 rounded-xl border-2 transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? "border-medical-primary bg-teal-50/40 shadow-md ring-2 ring-medical-primary/20 scale-[1.02]"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-white rounded-lg shadow-xs border border-gray-100">
                      {r.icon}
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-6 h-6 text-medical-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{r.title}</h3>
                    <p className="text-xs font-semibold text-medical-primary mt-0.5">{r.tagline}</p>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{r.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* If Doctor is selected, allow linking their centralized doctor profile */}
        {selectedRole === "doctor" && (
          <div className="mb-8 p-5 bg-teal-50 border border-teal-200 rounded-xl space-y-2 animate-in fade-in">
            <label className="block text-sm font-bold text-gray-900">
              Select Your Doctor Profile from Centralized Hospital Directory:
            </label>
            <p className="text-xs text-gray-600">
              Link your clinical account to access your assigned patients, consultation queue, and daily appointments.
            </p>
            <select
              value={doctorProfileId}
              onChange={(e) => setDoctorProfileId(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-medical-primary focus:border-medical-primary font-medium"
            >
              {DOCTORS.map(doc => (
                <option key={doc.doctorId} value={doc.doctorId}>
                  {doc.name} ({doc.department} - {doc.location})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
          <div className="text-sm text-gray-500 text-center sm:text-left">
            Signed in as <span className="font-semibold text-gray-900">{currentUser.email}</span>
          </div>

          <button
            type="button"
            onClick={handleConfirmRole}
            disabled={saving || !selectedRole}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-medical-primary hover:bg-medical-dark text-white font-bold px-8 py-3.5 rounded-lg shadow-md transition-all hover:shadow-lg disabled:opacity-50 cursor-pointer text-base"
          >
            {saving ? (
              "Setting up your account..."
            ) : (
              <>
                Continue as {roles.find((r) => r.id === selectedRole)?.title}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
