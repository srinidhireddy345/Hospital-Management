import { signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";

/**
 * Sanitizes a display name so it matches the Firestore rules:
 * name.matches('^[A-Za-z]+(?:\\s+[A-Za-z]+)*$')
 */
export const sanitizeName = (rawName) => {
  if (!rawName || typeof rawName !== "string") return "Patient";
  // Keep only alphabetical characters and spaces
  const cleaned = rawName.replace(/[^A-Za-z\s]/g, " ").trim().replace(/\s+/g, " ");
  return /^[A-Za-z]+(?:\s+[A-Za-z]+)*$/.test(cleaned) ? cleaned : "Patient";
};

/**
 * Logs required error details (error.code, error.message, error.customData)
 * and returns a clear, user-friendly message.
 */
export const logAndFormatAuthError = (err, context = "Google sign-in") => {
  console.error(`[${context}] Error details:`);
  console.error("error.code:", err?.code);
  console.error("error.message:", err?.message);
  console.error("error.customData:", err?.customData);
  console.error("Full error:", err);

  if (!err) return "Google sign-in failed.";

  if (err.code === "auth/operation-not-allowed") {
    return "Google sign-in is not enabled in Firebase Authentication. Please enable the Google provider in the Firebase Console (Authentication > Sign-in method).";
  }
  if (err.code === "auth/unauthorized-domain") {
    return "This domain is not authorized in Firebase Authentication. Please add 'localhost' (or your domain) under Authentication > Settings > Authorized domains in the Firebase Console.";
  }
  if (err.code === "auth/popup-closed-by-user") {
    return "Sign-in cancelled: The Google popup window was closed before completing sign-in.";
  }
  if (err.code === "auth/popup-blocked") {
    return "Sign-in popup was blocked by your browser. Please allow popups for this site.";
  }
  if (err.code === "auth/cancelled-popup-request") {
    return "Sign-in popup request was cancelled.";
  }
  if (err.code === "auth/network-request-failed") {
    return "Network error. Please check your internet connection.";
  }

  return err.message || "Google sign-in failed.";
};

/**
 * Handles successful Google authentication:
 * - Gets Firebase user
 * - Extracts uid, displayName, email
 * - Saves/creates user profile in Firestore if not existing
 * - Redirects to patient dashboard (or existing role dashboard)
 */
export const handleGoogleAuthSuccess = async (user, navigate, redirectUrl = null) => {
  const uid = user.uid;
  const displayName = user.displayName;
  const email = user.email;
  const photoUrl = user.photoURL;

  console.log("Google Sign-In authenticated successfully:", {
    uid,
    displayName,
    email,
    photoUrl
  });

  const userDocRef = doc(db, "users", uid);
  const userDoc = await getDoc(userDocRef);

  // If user already has a saved role in Firebase, redirect directly to their dashboard
  if (userDoc.exists() && userDoc.data()?.role) {
    const role = userDoc.data().role;
    console.log(`User already has role [${role}]. Redirecting to dashboard...`);

    let target = "/patient/dashboard";
    if (role === "doctor") {
      target = "/doctor/dashboard";
    } else if (role === "admin" || role === "receptionist") {
      target = "/receptionist/dashboard";
    } else {
      target = redirectUrl || "/patient/dashboard";
    }

    navigate(target, { replace: true });
    return { hasRole: true, role };
  }

  // If user is NEW or has NO role: DO NOT open any dashboard.
  // Show the role selection screen instead.
  console.log("New user with no role found. Redirecting to /select-role...");
  navigate("/select-role", { replace: true });
  return { hasRole: false };
};

/**
 * Executes Google sign-in using popup with automatic redirect fallback
 */
export const performGoogleSignIn = async (navigate, redirectUrl = null) => {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    await handleGoogleAuthSuccess(userCredential.user, navigate, redirectUrl);
    return { success: true };
  } catch (err) {
    if (err.code === "auth/popup-blocked") {
      console.warn("Popup blocked, attempting signInWithRedirect as fallback...");
      await signInWithRedirect(auth, googleProvider);
      return { redirecting: true };
    }
    const message = logAndFormatAuthError(err, "signInWithPopup");
    throw new Error(message);
  }
};

/**
 * Checks for any pending redirect result when mounting login/register pages
 */
export const checkRedirectResult = async (navigate, redirectUrl = null) => {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      await handleGoogleAuthSuccess(result.user, navigate, redirectUrl);
      return { success: true };
    }
    return { success: false };
  } catch (err) {
    const message = logAndFormatAuthError(err, "getRedirectResult");
    throw new Error(message);
  }
};
