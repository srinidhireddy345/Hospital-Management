import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        // Fetch user role from Firestore
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists() && userDoc.data()?.role) {
            const data = userDoc.data();
            setUserRole(data.role);
            setUserProfile({ id: userDoc.id, ...data });
          } else {
            // Requirement 11 & 13: Do NOT automatically assign as Patient.
            // Keep userRole as null so role selection is triggered.
            console.log("No role assigned for this user yet in Firestore.");
            setUserRole(null);
            setUserProfile(userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole(null);
          setUserProfile(null);
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = () => {
    return signOut(auth);
  };

  const value = {
    currentUser,
    setCurrentUser,
    userRole,
    setUserRole,
    userProfile,
    setUserProfile,
    loading,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
