import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { healthPackages } from "../../data/packages";
import { createHealthPackageBooking } from "../../services/healthPackageService";
import { getUserProfile } from "../../services/userService";
import { ArrowLeft, CheckCircle, Calendar as CalendarIcon, Clock, User, Phone, Mail } from "lucide-react";

export default function BookPackage() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const queryParams = new URLSearchParams(location.search);
  const pkgIdxStr = queryParams.get("pkgIdx");
  const pkgIdx = pkgIdxStr !== null ? parseInt(pkgIdxStr, 10) : null;

  const [step, setStep] = useState(1);
  const [patientProfile, setPatientProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const selectedPackage = pkgIdx !== null && pkgIdx >= 0 && pkgIdx < healthPackages.length ? healthPackages[pkgIdx] : null;

  useEffect(() => {
    async function fetchProfile() {
      if (currentUser) {
        try {
          const profile = await getUserProfile(currentUser.uid);
          setPatientProfile(profile);
        } catch (err) {
          console.error("Error fetching profile", err);
        }
      }
      setLoading(false);
    }
    fetchProfile();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-xl text-medical-primary font-semibold animate-pulse">Loading...</div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  const handleNext = () => {
    setError("");
    if (step === 2) {
      if (!selectedDate || !selectedTime) {
        setError("Please select both preferred date and time.");
        return;
      }
      if (selectedDate < today) {
        setError("Please select a valid future date.");
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError("");
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const bookingData = {
        patientId: currentUser.uid,
        patientName: patientProfile?.name || currentUser.displayName || "Patient",
        patientEmail: currentUser.email,
        patientPhone: patientProfile?.phone || "Not Provided",
        packageId: pkgIdx.toString(),
        packageName: selectedPackage.name,
        price: selectedPackage.price,
        preferredDate: selectedDate,
        preferredTime: selectedTime,
      };

      // Navigate to payment page with the payload instead of immediately saving
      navigate('/patient/health-packages/payment', { 
        state: { bookingData, selectedPackage } 
      });
    } catch (err) {
      setError(err.message || "Failed to process booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((num) => (
        <div key={num} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
            step >= num ? "bg-medical-primary text-white" : "bg-gray-200 text-gray-500"
          }`}>
            {num}
          </div>
          {num < 3 && (
            <div className={`w-16 h-1 ${step > num ? "bg-medical-primary" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );

  if (!selectedPackage) {
    return (
      <div className="bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Health Packages</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">Select a comprehensive health checkup package to monitor and maintain your wellbeing.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {healthPackages.map((pkg, idx) => (
              <div key={idx} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col text-gray-900 relative hover:shadow-md transition-shadow">
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
                    to={`/patient/health-packages?pkgIdx=${idx}`}
                    className="block w-full py-3 text-center bg-medical-primary hover:bg-medical-dark text-white font-bold rounded-md transition-colors mt-auto"
                  >
                    Select Package
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate('/patient/health-packages')}
          className="flex items-center text-medical-primary hover:text-medical-dark font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-1" /> Back to Packages
        </button>

        <div className="bg-white rounded-xl shadow-md p-6 sm:p-10 border border-gray-100">
          {step < 4 && <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">Book Health Checkup</h1>}
          {step < 4 && renderStepIndicator()}

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* STEP 1: Package & Patient Info */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="bg-slate-50 p-6 rounded-lg border border-gray-200">
                <h2 className="text-xl font-semibold text-medical-dark mb-4 border-b pb-2">Selected Package</h2>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{selectedPackage.name}</h3>
                  <span className="text-xl font-extrabold text-medical-primary">{selectedPackage.price}</span>
                </div>
                <p className="text-sm text-gray-600 italic mb-4">"{selectedPackage.keyBenefit}"</p>
                <div>
                  <p className="font-semibold text-sm mb-2 text-medical-dark">Includes:</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedPackage.tests.map((test, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-medical-primary shrink-0 mt-0.5" />
                        <span>{test}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-lg border border-gray-200">
                <h2 className="text-xl font-semibold text-medical-dark mb-4 border-b pb-2">Patient Information</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 font-medium">{patientProfile?.name || currentUser.displayName || "Patient"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{currentUser.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{patientProfile?.phone || "Not Provided"}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  onClick={handleNext}
                  className="bg-medical-primary hover:bg-medical-dark text-white px-8 py-3 rounded-md font-bold transition-colors"
                >
                  Continue to Schedule
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Date & Time Selection */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="bg-slate-50 p-6 rounded-lg border border-gray-200 text-center">
                <h2 className="text-xl font-semibold text-medical-dark mb-2">Schedule Your Checkup</h2>
                <p className="text-gray-600 text-sm">Please select your preferred date and time for the tests.</p>
              </div>

              <div className="space-y-6 max-w-md mx-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Appointment Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalendarIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      min={today}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="pl-10 block w-full shadow-sm focus:ring-medical-primary focus:border-medical-primary sm:text-sm border-gray-300 rounded-md py-3 border"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Time
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="pl-10 block w-full shadow-sm focus:ring-medical-primary focus:border-medical-primary sm:text-sm border-gray-300 rounded-md py-3 border"
                      required
                    >
                      <option value="">Select a time slot</option>
                      <option value="08:00 AM">08:00 AM</option>
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="12:00 PM">12:00 PM</option>
                      <option value="01:00 PM">01:00 PM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="03:00 PM">03:00 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button 
                  onClick={handleBack}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-8 py-3 rounded-md font-bold transition-colors"
                >
                  Back
                </button>
                <button 
                  onClick={handleNext}
                  className="bg-medical-primary hover:bg-medical-dark text-white px-8 py-3 rounded-md font-bold transition-colors"
                >
                  Review Booking
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Summary */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="bg-medical-green/20 p-6 rounded-lg border border-medical-primary/30">
                <h2 className="text-xl font-bold text-medical-dark mb-4 text-center border-b border-medical-primary/20 pb-4">Booking Summary</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-3 border-b border-gray-200 pb-2">
                    <span className="text-gray-500 font-medium col-span-1">Package</span>
                    <span className="text-gray-900 font-semibold col-span-2">{selectedPackage.name}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-gray-200 pb-2">
                    <span className="text-gray-500 font-medium col-span-1">Price</span>
                    <span className="text-medical-primary font-bold col-span-2">{selectedPackage.price}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-gray-200 pb-2">
                    <span className="text-gray-500 font-medium col-span-1">Patient</span>
                    <span className="text-gray-900 font-medium col-span-2">{patientProfile?.name || currentUser.displayName || "Patient"}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-gray-200 pb-2">
                    <span className="text-gray-500 font-medium col-span-1">Date</span>
                    <span className="text-gray-900 font-medium col-span-2">{selectedDate}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-gray-200 pb-2">
                    <span className="text-gray-500 font-medium col-span-1">Time</span>
                    <span className="text-gray-900 font-medium col-span-2">{selectedTime}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-gray-500 font-medium col-span-1">Status</span>
                    <span className="text-yellow-600 font-bold col-span-2">Pending</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button 
                  onClick={handleBack}
                  disabled={submitting}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-8 py-3 rounded-md font-bold transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-medical-primary hover:bg-medical-dark text-white px-8 py-3 rounded-md font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? "Processing..." : "Proceed to Payment"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Success */}
          {step === 4 && (
            <div className="text-center py-10 animate-in zoom-in duration-300">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Request Submitted</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Your health checkup package booking has been submitted successfully.
              </p>

              <div className="bg-slate-50 p-6 rounded-lg text-left max-w-md mx-auto mb-8 border border-gray-200">
                <p className="mb-2"><span className="text-gray-500 font-medium w-24 inline-block">Package:</span> <span className="font-semibold">{selectedPackage.name}</span></p>
                <p className="mb-2"><span className="text-gray-500 font-medium w-24 inline-block">Date:</span> <span className="font-medium">{selectedDate}</span></p>
                <p className="mb-2"><span className="text-gray-500 font-medium w-24 inline-block">Time:</span> <span className="font-medium">{selectedTime}</span></p>
                <p className="mt-4 pt-4 border-t text-sm text-gray-600 flex items-start gap-2">
                  <span className="font-bold text-medical-primary whitespace-nowrap">Status: Pending Confirmation</span>
                </p>
                <p className="text-xs text-gray-500 mt-2">You will receive a notification once the receptionist confirms your booking.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/patient/dashboard"
                  className="bg-white border border-medical-primary text-medical-primary hover:bg-slate-50 px-6 py-3 rounded-md font-bold transition-colors"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
