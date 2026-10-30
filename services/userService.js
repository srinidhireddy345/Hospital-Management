import { collection, getDocs, getDoc, updateDoc, doc, query, where, Timestamp, setDoc, deleteDoc, addDoc } from "firebase/firestore";
import { db } from "../firebase";

import DOCTORS, { getDoctorById } from "../data/doctors";

export const getDoctors = async () => {
  // Return the ONE centralized doctor database used by the entire application
  return DOCTORS;
};

export { getDoctorById, DOCTORS };

const NAME_REGEX = /^[A-Za-z]+(?:\s+[A-Za-z]+)*$/;

export const updateDoctorProfile = async (doctorId, data) => {
  if (data && data.name !== undefined) {
    const trimmed = typeof data.name === "string" ? data.name.trim() : "";
    if (trimmed && !NAME_REGEX.test(trimmed)) {
      throw new Error("Name must contain alphabets only.");
    }
    data.name = trimmed;
  }
  const ref = doc(db, "users", doctorId);
  return await updateDoc(ref, data);
};

export const createDoctorProfile = async (doctorData) => {
  if (doctorData && doctorData.name !== undefined) {
    const trimmed = typeof doctorData.name === "string" ? doctorData.name.trim() : "";
    if (trimmed && !NAME_REGEX.test(trimmed)) {
      throw new Error("Name must contain alphabets only.");
    }
    doctorData.name = trimmed;
  }
  return await addDoc(collection(db, "users"), {
    ...doctorData,
    role: "doctor",
    createdAt: Timestamp.now()
  });
};

export const deleteUser = async (userId) => {
  const ref = doc(db, "users", userId);
  return await deleteDoc(ref);
};

export const getUserProfile = async (userId) => {
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }
  return null;
};

export const updateUserProfile = async (userId, data) => {
  if (data && data.name !== undefined) {
    const trimmed = typeof data.name === "string" ? data.name.trim() : "";
    if (trimmed && !NAME_REGEX.test(trimmed)) {
      throw new Error("Name must contain alphabets only.");
    }
    data.name = trimmed;
  }
  const ref = doc(db, "users", userId);
  return await setDoc(ref, data, { merge: true });
};

export const getAllPatients = async () => {
  const q = query(collection(db, "users"), where("role", "==", "patient"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
