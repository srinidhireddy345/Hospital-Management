import { collection, addDoc, getDocs, doc, query, where, Timestamp, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

export const getDoctorAvailability = async (doctorId, date) => {
  const q = query(
    collection(db, "doctorAvailability"),
    where("doctorId", "==", doctorId),
    where("date", "==", date)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getAllAvailability = async () => {
  const snapshot = await getDocs(collection(db, "doctorAvailability"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const setDoctorAvailability = async (availabilityData) => {
  return await addDoc(collection(db, "doctorAvailability"), {
    ...availabilityData,
    createdAt: Timestamp.now()
  });
};

export const deleteDoctorAvailability = async (id) => {
  const ref = doc(db, "doctorAvailability", id);
  return await deleteDoc(ref);
};
