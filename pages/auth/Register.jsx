import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { getYesterdayDateString, isPastDOB, DOB_ERROR_MESSAGE } from "../../utils/dobValidation";
import {
  performGoogleSignIn,
  checkRedirectResult,
  handleGoogleAuthSuccess
} from "../../utils/googleAuthHelper";

const NAME_REGEX = /^[A-Za-z]+(?:\s+[A-Za-z]+)*$/;

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [dobError, setDobError] = useState("");
  const [role, setRole] = useState("patient"); // default role
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is returning from a Google redirect sign-in
  useEffect(() => {
    checkRedirectResult(navigate).catch((err) => {
      setError(err.message);
    });
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await performGoogleSignIn(navigate);
    } catch (err) {
      setError(err.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);

    const trimmed = val.trim();
    if (trimmed.length > 0) {
      if (!NAME_REGEX.test(trimmed)) {
        setNameError("Name must contain alphabets only.");
        setError("Name must contain alphabets only.");
      } else {
        setNameError("");
        if (error === "Name must contain alphabets only.") {
          setError("");
        }
      }
    } else {
      setNameError("");
      if (error === "Name must contain alphabets only.") {
        setError("");
      }
    }
  };

  const handleDobChange = (e) => {
    const val = e.target.value;
    setDob(val);

    if (val) {
      if (!isPastDOB(val)) {
        setDobError(DOB_ERROR_MESSAGE);
        setError(DOB_ERROR_MESSAGE);
      } else {
        setDobError("");
        if (error === DOB_ERROR_MESSAGE) {
          setError("");
        }
      }
    } else {
      setDobError("");
      if (error === DOB_ERROR_MESSAGE) {
        setError("");
      }
    }
  };

  const handleDobBlur = () => {
    if (dob) {
      if (!isPastDOB(dob)) {
        setDobError(DOB_ERROR_MESSAGE);
        setError(DOB_ERROR_MESSAGE);
      } else {
        setDobError("");
        if (error === DOB_ERROR_MESSAGE) {
          setError("");
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Trim unnecessary spaces before validation
    const trimmedName = name.trim();

    // Validate using the required regex rule: /^[A-Za-z]+(?:\s+[A-Za-z]+)*$/
    if (!trimmedName || !NAME_REGEX.test(trimmedName)) {
      setError("Name must contain alphabets only.");
      setNameError("Name must contain alphabets only.");
      return;
    }
    setNameError("");

    // Validate DOB: must be a date in the past (yesterday or earlier)
    if (!dob || !isPastDOB(dob)) {
      setError(DOB_ERROR_MESSAGE);
      setDobError(DOB_ERROR_MESSAGE);
      return;
    }
    setDobError("");

    setLoading(true);

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        name: trimmedName,
        phone: phone,
        dob: dob,
        role: role,
        ...(role === "doctor" ? { specialization: "General Medicine", location: "Mumbai" } : {}),
        createdAt: new Date()
      });

      // Redirect to their dashboard
      navigate(`/${role}/dashboard`, { replace: true });
    } catch (err) {
      setError("Failed to create an account. " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border-t-4 border-medical-primary">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create an account
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-3">
            <div>
              <input
                name="name"
                type="text"
                required
                className={`appearance-none relative block w-full px-3 py-2 border ${nameError ? "border-red-500" : "border-gray-300"} placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-medical-primary focus:border-medical-primary focus:z-10 sm:text-sm`}
                placeholder="Full Name"
                value={name}
                onChange={handleNameChange}
              />
              {nameError && (
                <p className="mt-1 text-xs text-red-600">{nameError}</p>
              )}
            </div>
            <div>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-medical-primary focus:border-medical-primary focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                name="phone"
                type="tel"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-medical-primary focus:border-medical-primary focus:z-10 sm:text-sm"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="sr-only">Date of Birth</label>
              <input
                name="dob"
                type="date"
                required
                max={getYesterdayDateString()}
                className={`appearance-none relative block w-full px-3 py-2 border ${dobError ? "border-red-500" : "border-gray-300"} placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-medical-primary focus:border-medical-primary focus:z-10 sm:text-sm`}
                value={dob}
                onChange={handleDobChange}
                onBlur={handleDobBlur}
              />
              {dobError && (
                <p className="text-xs text-red-600 mt-1">{dobError}</p>
              )}
            </div>
            <div>
              <input
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-medical-primary focus:border-medical-primary focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <select
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-medical-primary focus:border-medical-primary focus:z-10 sm:text-sm"
              >
                <option value="patient">Patient</option>
                <option value="receptionist">Receptionist</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-medical-primary hover:bg-medical-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-primary disabled:opacity-50 transition-colors"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <img className="h-5 w-5 mr-2" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" />
              Sign in with Google
            </button>
          </div>
        </div>

        <div className="text-center mt-4">
          <Link to="/login" className="font-medium text-medical-primary hover:text-medical-dark text-sm">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
