import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBQq2Fevxc1bEYCDC5_DjzMA7HZwkM6uLI",
  authDomain: "mediconnect-15d81.firebaseapp.com",
  projectId: "mediconnect-15d81",
  storageBucket: "mediconnect-15d81.firebasestorage.app",
  messagingSenderId: "145309423480",
  appId: "1:145309423480:web:a3d06fcbeb27bb92785a8d",
  measurementId: "G-WTYRF5715T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account"
});
