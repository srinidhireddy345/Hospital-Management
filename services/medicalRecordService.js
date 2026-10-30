import { collection, addDoc, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "../firebase";

export const uploadMedicalRecord = async (patientId, file) => {
  if (!file) throw new Error("No file selected");
  
  if (file.size > 700 * 1024) {
    throw new Error("File is too large! Please upload a file smaller than 700KB.");
  }
  
  const toBase64 = (f) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(f);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
  
  const fileUrl = await toBase64(file);
  
  const recordData = {
    patientId,
    fileName: file.name,
    fileUrl,
    uploadedAt: Timestamp.now()
  };
  
  const docRef = await addDoc(collection(db, "medicalRecords"), recordData);
  return { id: docRef.id, ...recordData };
};

export const getMedicalRecordsByPatient = async (patientId) => {
  const q = query(collection(db, "medicalRecords"), where("patientId", "==", patientId));
  const snapshot = await getDocs(q);
  const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return records.sort((a, b) => b.uploadedAt.toMillis() - a.uploadedAt.toMillis());
};
