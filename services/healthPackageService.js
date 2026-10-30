import { collection, addDoc, getDocs, updateDoc, doc, query, where, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { createNotification } from "./notificationService";

export const createHealthPackageBooking = async (bookingData) => {
  const q = query(
    collection(db, "healthPackageBookings"),
    where("patientId", "==", bookingData.patientId),
    where("packageName", "==", bookingData.packageName),
    where("preferredDate", "==", bookingData.preferredDate),
    where("preferredTime", "==", bookingData.preferredTime),
    where("status", "in", ["PENDING", "CONFIRMED", "RESCHEDULED"])
  );
  const existingBookings = await getDocs(q);
  
  if (!existingBookings.empty) {
    throw new Error("You already have a booking for this package at the selected date and time.");
  }

  const bookingRef = await addDoc(collection(db, "healthPackageBookings"), {
    ...bookingData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });

  // Notify receptionists
  const recQ = query(collection(db, "users"), where("role", "==", "receptionist"));
  const recSnap = await getDocs(recQ);
  recSnap.forEach(async (docSnap) => {
    await createNotification(
      docSnap.id,
      `New health checkup booking request received from ${bookingData.patientName}.`
    );
  });

  return { id: bookingRef.id, ...bookingData };
};

export const getHealthPackageBookingsByPatient = async (patientId) => {
  const q = query(collection(db, "healthPackageBookings"), where("patientId", "==", patientId));
  const snapshot = await getDocs(q);
  const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return bookings.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
};

export const getAllHealthPackageBookings = async () => {
  const snapshot = await getDocs(collection(db, "healthPackageBookings"));
  const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return bookings.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
};

export const updateHealthPackageBookingStatus = async (bookingId, newStatus, patientId, packageName) => {
  const ref = doc(db, "healthPackageBookings", bookingId);
  await updateDoc(ref, { 
    status: newStatus,
    updatedAt: Timestamp.now()
  });

  let message = "";
  if (newStatus === "CONFIRMED") {
    message = `Your health checkup booking for ${packageName} has been confirmed.`;
  } else if (newStatus === "CANCELLED") {
    message = `Your health checkup booking for ${packageName} has been cancelled.`;
  }
  
  if (message && patientId) {
    await createNotification(patientId, message);
  }
};

export const rescheduleHealthPackageBooking = async (bookingId, newDate, newTime, patientId, packageName) => {
  const ref = doc(db, "healthPackageBookings", bookingId);
  await updateDoc(ref, { 
    preferredDate: newDate,
    preferredTime: newTime,
    status: "RESCHEDULED",
    updatedAt: Timestamp.now()
  });

  await createNotification(
    patientId,
    `Your health checkup booking for ${packageName} has been rescheduled to ${newDate} at ${newTime}.`
  );
};
