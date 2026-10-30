import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  Timestamp, 
  onSnapshot 
} from "firebase/firestore";
import { db } from "../firebase";
import { formatDoctorName, formatDateDisplay } from "../data/doctors";
import { notifyPatient, notifyDoctor, notifyAllReceptionists } from "./notificationService";

export const getAppointmentsByPatient = async (patientId) => {
  if (!patientId) return [];
  const q = query(collection(db, "appointments"), where("patientId", "==", patientId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      bookingId: data.bookingId || doc.id,
      bookingStatus: data.bookingStatus || data.status || "Confirmed",
      ...data,
      doctorName: formatDoctorName(data.doctorName)
    };
  });
};

/**
 * Real-time listener for patient appointments
 */
export const subscribeToPatientAppointments = (patientId, callback) => {
  if (!patientId) {
    callback([]);
    return () => {};
  }
  const q = query(collection(db, "appointments"), where("patientId", "==", patientId));
  return onSnapshot(
    q, 
    (snapshot) => {
      const results = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          bookingId: data.bookingId || doc.id,
          bookingStatus: data.bookingStatus || data.status || "Confirmed",
          ...data,
          doctorName: formatDoctorName(data.doctorName)
        };
      });
      results.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      callback(results);
    },
    (err) => {
      console.warn("Patient appointments subscription fallback:", err);
      getAppointmentsByPatient(patientId).then(callback).catch(() => callback([]));
    }
  );
};

export const getAppointmentsByDoctor = async (doctorId, doctorName = null) => {
  if (!doctorId && !doctorName) return [];
  
  const results = [];
  const seenIds = new Set();

  if (doctorId) {
    const q = query(collection(db, "appointments"), where("doctorId", "==", doctorId));
    const snapshot = await getDocs(q);
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      seenIds.add(doc.id);
      results.push({
        id: doc.id,
        bookingId: data.bookingId || doc.id,
        bookingStatus: data.bookingStatus || data.status || "Confirmed",
        ...data,
        doctorName: formatDoctorName(data.doctorName)
      });
    });
  }

  // Fallback to doctorName if provided to capture any legacy appointments
  if (doctorName) {
    const formattedName = formatDoctorName(doctorName);
    const qName = query(collection(db, "appointments"), where("doctorName", "==", formattedName));
    const snapName = await getDocs(qName);
    snapName.docs.forEach(doc => {
      if (!seenIds.has(doc.id)) {
        const data = doc.data();
        seenIds.add(doc.id);
        results.push({
          id: doc.id,
          bookingId: data.bookingId || doc.id,
          bookingStatus: data.bookingStatus || data.status || "Confirmed",
          ...data,
          doctorName: formatDoctorName(data.doctorName)
        });
      }
    });
  }

  return results;
};

/**
 * Real-time listener for appointments of a specific doctorId.
 * Triggers callback immediately and on every new booking, cancellation, or status change.
 */
export const subscribeToDoctorAppointments = (doctorId, doctorName, callback) => {
  if (!doctorId && !doctorName) {
    callback([]);
    return () => {};
  }

  const q = doctorId 
    ? query(collection(db, "appointments"), where("doctorId", "==", doctorId))
    : query(collection(db, "appointments"), where("doctorName", "==", formatDoctorName(doctorName)));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const results = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          bookingId: data.bookingId || doc.id,
          bookingStatus: data.bookingStatus || data.status || "Confirmed",
          ...data,
          doctorName: formatDoctorName(data.doctorName)
        };
      });
      results.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      callback(results);
    },
    (error) => {
      console.warn("Real-time appointment subscription fallback to fetch:", error);
      getAppointmentsByDoctor(doctorId, doctorName)
        .then(callback)
        .catch(() => callback([]));
    }
  );

  return unsubscribe;
};

export const getAllAppointments = async () => {
  const snapshot = await getDocs(collection(db, "appointments"));
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      bookingId: data.bookingId || doc.id,
      bookingStatus: data.bookingStatus || data.status || "Confirmed",
      ...data,
      doctorName: formatDoctorName(data.doctorName)
    };
  });
};

/**
 * Real-time listener for all hospital appointments (for receptionist).
 */
export const subscribeToAllAppointments = (callback) => {
  const q = collection(db, "appointments");
  return onSnapshot(
    q,
    (snapshot) => {
      const results = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          bookingId: data.bookingId || doc.id,
          bookingStatus: data.bookingStatus || data.status || "Confirmed",
          ...data,
          doctorName: formatDoctorName(data.doctorName)
        };
      });
      results.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      callback(results);
    },
    (error) => {
      console.warn("Real-time all appointments fallback to fetch:", error);
      getAllAppointments().then(callback).catch(() => callback([]));
    }
  );
};

export const createAppointment = async (appointmentData) => {
  const doctorId = appointmentData.doctorId;
  const date = appointmentData.date;
  const timeSlot = appointmentData.timeSlot;

  if (doctorId && date && timeSlot) {
    const q = query(
      collection(db, "appointments"), 
      where("doctorId", "==", doctorId),
      where("date", "==", date),
      where("timeSlot", "==", timeSlot)
    );
    const existingAppts = await getDocs(q);
    
    const isBooked = existingAppts.docs.some(doc => {
      const data = doc.data();
      return data.status === "Pending" || data.status === "Confirmed" ||
             data.bookingStatus === "Pending" || data.bookingStatus === "Confirmed";
    });
    
    if (isBooked) {
      throw new Error("This time slot is already booked.");
    }
  }

  const bookingId = appointmentData.bookingId || `BK-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const bookingStatus = appointmentData.bookingStatus || appointmentData.status || "Confirmed";
  const doctorName = formatDoctorName(appointmentData.doctorName);

  const finalRecord = {
    ...appointmentData,
    bookingId,
    bookingStatus,
    status: bookingStatus,
    doctorName,
    createdAt: appointmentData.createdAt || Timestamp.now()
  };

  const docRef = await addDoc(collection(db, "appointments"), finalRecord);
  return { id: docRef.id, ...finalRecord };
};

export const updateAppointmentStatus = async (appointmentId, status) => {
  const ref = doc(db, "appointments", appointmentId);
  return await updateDoc(ref, { 
    status, 
    bookingStatus: status,
    updatedAt: Timestamp.now() 
  });
};

export const completeAppointment = async (appointmentId, notes) => {
  const ref = doc(db, "appointments", appointmentId);
  return await updateDoc(ref, { 
    status: 'Completed', 
    bookingStatus: 'Completed',
    notes: notes,
    completedAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
};

/**
 * Doctor cancels an appointment with confirmation, reason, and notifications.
 */
export const cancelAppointmentByDoctor = async (appointmentId, doctorId, reason, cancelledByName = "Doctor") => {
  if (!appointmentId) throw new Error("Appointment ID is required.");
  const ref = doc(db, "appointments", appointmentId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    throw new Error("Appointment record not found.");
  }
  const data = snap.data();

  // Edge cases:
  // 1. Do not allow cancellation of an already cancelled appointment
  if (data.status === "Cancelled" || data.bookingStatus === "Cancelled" || data.status === "cancelled") {
    throw new Error("This appointment has already been cancelled.");
  }
  // 2. Do not allow cancellation of a completed appointment
  if (data.status === "Completed" || data.bookingStatus === "Completed") {
    throw new Error("Cannot cancel an already completed appointment.");
  }
  // 3. Security: Doctor can cancel only appointments belonging to that doctor
  if (doctorId && data.doctorId && data.doctorId !== doctorId) {
    throw new Error("You are only authorized to cancel your own appointments.");
  }

  const cancellationReason = reason && reason.trim() ? reason.trim() : "Cancelled by doctor";
  const now = Timestamp.now();

  await updateDoc(ref, {
    status: "Cancelled",
    bookingStatus: "Cancelled",
    cancelReason: cancellationReason,
    cancellationReason: cancellationReason,
    cancelledBy: "doctor",
    cancelledByName: cancelledByName || data.doctorName || "Doctor",
    cancelledAt: now,
    updatedAt: now
  });

  const docName = formatDoctorName(data.doctorName || cancelledByName);
  const dateStr = formatDateDisplay(data.date);
  const timeStr = data.timeSlot || "";

  // 1. Notify Patient:
  // "Your appointment with Dr. [Doctor Name] on [Date] at [Time] has been cancelled by the doctor."
  if (data.patientId) {
    await notifyPatient(
      data.patientId,
      `Your appointment with ${docName} on ${dateStr} at ${timeStr} has been cancelled by the doctor. Reason: ${cancellationReason}`,
      { appointmentId, type: "appointment_cancelled", cancelledBy: "doctor" }
    );
  }

  // 2. Notify Receptionist:
  // "Appointment with Dr. [Doctor Name] for [Patient Name] on [Date] at [Time] has been cancelled by the doctor."
  await notifyAllReceptionists(
    `Appointment with ${docName} for ${data.patientName || "Patient"} on ${dateStr} at ${timeStr} has been cancelled by the doctor. Reason: ${cancellationReason}`,
    { appointmentId, type: "appointment_cancelled", cancelledBy: "doctor" }
  );

  return {
    id: appointmentId,
    ...data,
    status: "Cancelled",
    bookingStatus: "Cancelled",
    cancelReason: cancellationReason,
    cancelledBy: "doctor",
    cancelledAt: now
  };
};

/**
 * Patient cancels their appointment.
 */
export const cancelAppointmentByPatient = async (appointmentId, patientId, reason) => {
  if (!appointmentId) throw new Error("Appointment ID is required.");
  const ref = doc(db, "appointments", appointmentId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Appointment not found.");
  const data = snap.data();

  if (data.status === "Cancelled" || data.bookingStatus === "Cancelled") {
    throw new Error("This appointment is already cancelled.");
  }
  if (data.status === "Completed" || data.bookingStatus === "Completed") {
    throw new Error("Cannot cancel a completed appointment.");
  }
  if (patientId && data.patientId && data.patientId !== patientId) {
    throw new Error("You are not authorized to cancel this appointment.");
  }

  const cancellationReason = reason && reason.trim() ? reason.trim() : "Cancelled by patient";
  const now = Timestamp.now();

  await updateDoc(ref, {
    status: "Cancelled",
    bookingStatus: "Cancelled",
    cancelReason: cancellationReason,
    cancellationReason: cancellationReason,
    cancelledBy: "patient",
    cancelledAt: now,
    updatedAt: now
  });

  const docName = formatDoctorName(data.doctorName);
  const dateStr = formatDateDisplay(data.date);
  const timeStr = data.timeSlot || "";
  const patName = data.patientName || "Patient";

  // Notify Doctor: Patient cancelled appointment
  await notifyDoctor(
    data.doctorId,
    `Patient ${patName} cancelled their appointment scheduled for ${dateStr} at ${timeStr}. Reason: ${cancellationReason}`,
    { appointmentId, type: "appointment_cancelled", cancelledBy: "patient" }
  );

  // Notify Receptionist: Appointment cancelled
  await notifyAllReceptionists(
    `Patient ${patName} cancelled their appointment with ${docName} on ${dateStr} at ${timeStr}. Reason: ${cancellationReason}`,
    { appointmentId, type: "appointment_cancelled", cancelledBy: "patient" }
  );

  // Notify Patient confirmation
  if (data.patientId) {
    await notifyPatient(
      data.patientId,
      `You have cancelled your appointment with ${docName} on ${dateStr} at ${timeStr}.`,
      { appointmentId, type: "appointment_cancelled", cancelledBy: "patient" }
    );
  }

  return { id: appointmentId, ...data, status: "Cancelled", cancelReason: cancellationReason, cancelledBy: "patient" };
};

export const rescheduleAppointment = async (appointmentId, doctorId, date, timeSlot) => {
  // Check for double booking
  const q = query(
    collection(db, "appointments"), 
    where("doctorId", "==", doctorId),
    where("date", "==", date),
    where("timeSlot", "==", timeSlot)
  );
  const existingAppts = await getDocs(q);
  
  const isBooked = existingAppts.docs.some(doc => {
    const data = doc.data();
    return (data.status === "Pending" || data.status === "Confirmed") && doc.id !== appointmentId;
  });
  
  if (isBooked) {
    throw new Error("This time slot is already booked.");
  }

  const ref = doc(db, "appointments", appointmentId);
  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : {};

  await updateDoc(ref, {
    date,
    timeSlot,
    status: 'Confirmed',
    bookingStatus: 'Confirmed',
    updatedAt: Timestamp.now()
  });

  const docName = formatDoctorName(data.doctorName);
  const newDateStr = formatDateDisplay(date);

  // 1. Notify Patient:
  if (data.patientId) {
    await notifyPatient(
      data.patientId,
      `Your appointment with ${docName} has been rescheduled to ${newDateStr} at ${timeSlot}.`,
      { appointmentId, type: "appointment_rescheduled" }
    );
  }

  // 2. Notify Doctor:
  await notifyDoctor(
    doctorId,
    `Appointment with ${data.patientName || "Patient"} has been rescheduled to ${newDateStr} at ${timeSlot}.`,
    { appointmentId, type: "appointment_rescheduled" }
  );

  // 3. Notify Receptionists:
  await notifyAllReceptionists(
    `Appointment with ${docName} for ${data.patientName || "Patient"} rescheduled to ${newDateStr} at ${timeSlot}.`,
    { appointmentId, type: "appointment_rescheduled" }
  );

  return { id: appointmentId, ...data, date, timeSlot, status: 'Confirmed' };
};

/**
 * Receptionist cancels an appointment with confirmation, reason, and notifications.
 */
export const cancelAppointmentByReceptionist = async (appointmentId, reason = "Cancelled by hospital reception") => {
  if (!appointmentId) throw new Error("Appointment ID is required.");
  const ref = doc(db, "appointments", appointmentId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Appointment not found.");
  const data = snap.data();

  if (data.status === "Cancelled" || data.bookingStatus === "Cancelled") {
    throw new Error("This appointment is already cancelled.");
  }
  if (data.status === "Completed" || data.bookingStatus === "Completed") {
    throw new Error("Cannot cancel a completed appointment.");
  }

  const cancellationReason = reason && reason.trim() ? reason.trim() : "Cancelled by hospital reception";
  const now = Timestamp.now();

  await updateDoc(ref, {
    status: "Cancelled",
    bookingStatus: "Cancelled",
    cancelReason: cancellationReason,
    cancellationReason: cancellationReason,
    cancelledBy: "receptionist",
    cancelledAt: now,
    updatedAt: now
  });

  const docName = formatDoctorName(data.doctorName);
  const dateStr = formatDateDisplay(data.date);
  const timeStr = data.timeSlot || "";
  const patName = data.patientName || "Patient";

  // 1. Notify Patient
  if (data.patientId) {
    await notifyPatient(
      data.patientId,
      `Your appointment with ${docName} on ${dateStr} at ${timeStr} has been cancelled by hospital reception. Reason: ${cancellationReason}`,
      { appointmentId, type: "appointment_cancelled", cancelledBy: "receptionist" }
    );
  }

  // 2. Notify Doctor
  await notifyDoctor(
    data.doctorId,
    `Appointment with ${patName} on ${dateStr} at ${timeStr} has been cancelled by hospital reception. Reason: ${cancellationReason}`,
    { appointmentId, type: "appointment_cancelled", cancelledBy: "receptionist" }
  );

  // 3. Notify Receptionists
  await notifyAllReceptionists(
    `Appointment with ${docName} for ${patName} on ${dateStr} at ${timeStr} has been cancelled by reception. Reason: ${cancellationReason}`,
    { appointmentId, type: "appointment_cancelled", cancelledBy: "receptionist" }
  );

  return { id: appointmentId, ...data, status: "Cancelled", cancelReason: cancellationReason, cancelledBy: "receptionist" };
};

/**
 * Receptionist confirms an appointment with notifications to Patient, Doctor, and Reception.
 */
export const confirmAppointmentByReceptionist = async (appointmentId) => {
  if (!appointmentId) throw new Error("Appointment ID is required.");
  const ref = doc(db, "appointments", appointmentId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Appointment not found.");
  const data = snap.data();

  const now = Timestamp.now();
  await updateDoc(ref, {
    status: "Confirmed",
    bookingStatus: "Confirmed",
    updatedAt: now
  });

  const docName = formatDoctorName(data.doctorName);
  const dateStr = formatDateDisplay(data.date);
  const timeStr = data.timeSlot || "";
  const patName = data.patientName || "Patient";

  // 1. Notify Patient: "Appointment confirmed"
  if (data.patientId) {
    await notifyPatient(
      data.patientId,
      `Your appointment with ${docName} on ${dateStr} at ${timeStr} has been confirmed.`,
      { appointmentId, type: "appointment_confirmed" }
    );
  }

  // 2. Notify Doctor: "Appointment confirmed"
  await notifyDoctor(
    data.doctorId,
    `Appointment with ${patName} on ${dateStr} at ${timeStr} is now confirmed.`,
    { appointmentId, type: "appointment_confirmed" }
  );

  // 3. Notify Receptionists:
  await notifyAllReceptionists(
    `Appointment with ${docName} for ${patName} on ${dateStr} at ${timeStr} has been confirmed.`,
    { appointmentId, type: "appointment_confirmed" }
  );

  return { id: appointmentId, ...data, status: "Confirmed", bookingStatus: "Confirmed" };
};

/**
 * Send appointment reminder notification to Patient and Doctor.
 */
export const sendAppointmentReminder = async (appointmentId) => {
  if (!appointmentId) throw new Error("Appointment ID is required.");
  const ref = doc(db, "appointments", appointmentId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Appointment not found.");
  const data = snap.data();

  const docName = formatDoctorName(data.doctorName);
  const dateStr = formatDateDisplay(data.date);
  const timeStr = data.timeSlot || "";
  const patName = data.patientName || "Patient";

  // Notify Patient:
  if (data.patientId) {
    await notifyPatient(
      data.patientId,
      `Reminder: You have an upcoming appointment with ${docName} on ${dateStr} at ${timeStr}.`,
      { appointmentId, type: "appointment_reminder" }
    );
  }

  // Notify Doctor:
  await notifyDoctor(
    data.doctorId,
    `Reminder: You have an upcoming appointment with ${patName} on ${dateStr} at ${timeStr}.`,
    { appointmentId, type: "appointment_reminder" }
  );

  return { success: true };
};
