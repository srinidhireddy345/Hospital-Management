import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import {
  performGoogleSignIn,
  checkRedirectResult,
  sanitizeName
} from "../../utils/googleAuthHelper";
import { ArrowLeft, CheckCircle, AlertCircle, KeyRound } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot Password feature state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userRole, setCurrentUser, setUserRole, loading: authLoading } = useAuth();
  const redirectParams = new URLSearchParams(location.search).get("redirect");

  // Check if user is returning from a Google redirect sign-in
  useEffect(() => {
    checkRedirectResult(navigate, redirectParams).catch((err) => {
      setError(err.message);
    });
  }, [navigate, redirectParams]);

  // If user is already authenticated, redirect appropriately
  useEffect(() => {
    if (!authLoading && currentUser) {
      if (userRole) {
        let target = "/patient/dashboard";
        if (userRole === "doctor") {
          target = "/doctor/dashboard";
        } else if (userRole === "admin" || userRole === "receptionist") {
          target = "/receptionist/dashboard";
        } else {
          target = redirectParams || "/patient/dashboard";
        }
        navigate(target, { replace: true });
      } else {
        // Authenticated with Firebase, but no role selected yet
        navigate("/select-role", { replace: true });
      }
    }
  }, [currentUser, userRole, authLoading, navigate, redirectParams]);

  const handleRoleRedirect = async (user) => {
    const uid = user.uid;
    const userDocRef = doc(db, "users", uid);

    try {
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists() && userDoc.data()?.role) {
        const role = userDoc.data().role;
        if (setCurrentUser) setCurrentUser(user);
        if (setUserRole) setUserRole(role);

        let target = "/patient/dashboard";
        if (role === "doctor") {
          target = "/doctor/dashboard";
        } else if (role === "admin" || role === "receptionist") {
          target = "/receptionist/dashboard";
        } else {
          target = redirectParams || "/patient/dashboard";
        }

        console.log(`User ${user.email} authenticated. Role: ${role}. Redirecting to ${target}`);
        navigate(target, { replace: true });
        return;
      }
    } catch (err) {
      console.warn("Error reading user role from Firestore:", err);
    }

    // If user has NO assigned role: DO NOT assign a default role.
    // Instead show the role selection screen!
    console.log(`User ${user.email} has no assigned role. Redirecting to /select-role...`);
    navigate("/select-role", { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Requirement 1 & 2: Use Firebase signInWithEmailAndPassword
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);

      // Requirement 4: Redirect ONLY after Firebase confirms successful login
      if (userCredential && userCredential.user) {
        await handleRoleRedirect(userCredential.user);
      } else {
        throw new Error("No user returned from Firebase authentication.");
      }
    } catch (err) {
      console.error("Firebase email/password login error:", err);
      // Requirement 8: Show actual Firebase error message on failure
      let message = err.message || "Failed to log in.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        message = "Invalid email or password. Please check your credentials.";
      } else if (err.code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      } else if (err.code === "auth/user-disabled") {
        message = "This user account has been disabled.";
      } else if (err.code === "auth/too-many-requests") {
        message = "Too many failed login attempts. Please try again later or reset your password.";
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await performGoogleSignIn(navigate, redirectParams);
    } catch (err) {
      setError(err.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  // Requirement 3, 4, 5, 6: Password reset using Firebase sendPasswordResetEmail()
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setResetSuccess("");
    setResetError("");

    const trimmedEmail = resetEmail.trim();

    // Requirement 6: Validate email field is not empty
    if (!trimmedEmail) {
      setResetError("Please enter your registered email address.");
      return;
    }

    // Requirement 6: Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setResetError("Please enter a valid email address.");
      return;
    }

    setResetLoading(true);

    try {
      // Requirement 4: Send a password reset email using Firebase sendPasswordResetEmail()
      await sendPasswordResetEmail(auth, trimmedEmail);

      // Requirement 5: Success message
      setResetSuccess("Password reset email sent. Please check your inbox.");
      setResetError("");
    } catch (err) {
      console.error("Firebase sendPasswordResetEmail error:", err);
      // Requirement 5: Error message
      let message = err.message || "Failed to send password reset email.";
      if (err.code === "auth/user-not-found") {
        message = "No account found with this email.";
      } else if (err.code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      } else if (err.code === "auth/missing-email") {
        message = "Please enter your registered email address.";
      } else if (err.code === "auth/too-many-requests") {
        message = "Too many attempts. Please try again later.";
      }
      setResetError(message);
      setResetSuccess("");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border-t-4 border-medical-primary">
        {showForgotPassword ? (
          /* Password Reset Form */
          <div className="space-y-6">
            <div>
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetSuccess("");
                  setResetError("");
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-medical-primary transition-colors mb-4"
              >
                <ArrowLeft size={15} /> Back to Sign In
              </button>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-50 text-medical-primary rounded-lg">
                  <KeyRound size={22} />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">
                  Reset Password
                </h2>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Enter your registered email address below. We'll send you an official password reset link.
              </p>
            </div>

            {resetSuccess && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-md">
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-green-800">{resetSuccess}</p>
                </div>
              </div>
            )}

            {resetError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-red-700">{resetError}</p>
                </div>
              </div>
            )}

            <form className="mt-6 space-y-5" onSubmit={handlePasswordReset}>
              <div>
                <label htmlFor="reset-email" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Registered Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="reset-email"
                  name="resetEmail"
                  type="email"
                  autoComplete="email"
                  required
                  autoFocus
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-medical-primary focus:border-medical-primary sm:text-sm"
                  placeholder="Enter your registered email"
                  value={resetEmail}
                  onChange={(e) => {
                    setResetEmail(e.target.value);
                    if (resetError) setResetError("");
                  }}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-medical-primary hover:bg-medical-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-primary disabled:opacity-50 transition-colors shadow-sm"
                >
                  {resetLoading ? "Sending reset email..." : "Send Password Reset Link"}
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetSuccess("");
                    setResetError("");
                  }}
                  className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Remembered your password? <span className="font-semibold text-medical-primary hover:underline">Sign In</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Normal Sign In Form */
          <>
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Sign in to your account
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
              <div className="rounded-md shadow-sm space-y-4">
                <div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-medical-primary focus:border-medical-primary focus:z-10 sm:text-sm"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-medical-primary focus:border-medical-primary focus:z-10 sm:text-sm"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {/* Requirement 1: Forgot Password link below password field */}
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setResetEmail(email.trim());
                      setResetSuccess("");
                      setResetError("");
                      setError("");
                    }}
                    className="text-xs font-semibold text-medical-primary hover:text-medical-dark hover:underline focus:outline-none transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-medical-primary hover:bg-medical-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-primary disabled:opacity-50 transition-colors"
                >
                  {loading ? "Signing in..." : "Sign In"}
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
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <img className="h-5 w-5 mr-2" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" />
                  Sign in with Google
                </button>
              </div>
            </div>

            <div className="text-center mt-4">
              <Link to="/register" className="font-medium text-medical-primary hover:text-medical-dark text-sm">
                Don't have an account? Register here
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
