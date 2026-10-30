import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  where, 
  Timestamp, 
  onSnapshot 
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Creates a single notification in Firestore linked to a recipient.
 */
export const createNotification = async (recipientUid, message, extra = {}) => {
  if (!recipientUid || !message) return null;
  return await addDoc(collection(db, "notifications"), {
    recipientUid,
    message,
    isRead: false,
    timestamp: Timestamp.now(),
    createdAt: Timestamp.now(),
    ...extra
  });
};

/**
 * Notifies a patient by their Firebase Auth UID.
 */
export const notifyPatient = async (patientUid, message, extra = {}) => {
  if (!patientUid) return null;
  return await createNotification(patientUid, message, {
    recipientRole: "patient",
    ...extra
  });
};

/**
 * Notifies a doctor using both doctorId (e.g. "doc-01") and any linked user account UID.
 */
export const notifyDoctor = async (doctorId, message, extra = {}) => {
  if (!doctorId && !extra.doctorName) return null;
  const promises = [];

  // 1. Notify the unique doctorId
  if (doctorId) {
    promises.push(createNotification(doctorId, message, {
      doctorId,
      recipientRole: "doctor",
      ...extra
    }));
  }

  // 2. Also find and notify any registered user whose profile has this doctorId or name
  try {
    const qDoc = doctorId 
      ? query(collection(db, "users"), where("doctorId", "==", doctorId))
      : query(collection(db, "users"), where("role", "==", "doctor"));
    const snap = await getDocs(qDoc);
    snap.forEach((userDoc) => {
      if (userDoc.id !== doctorId) {
        promises.push(createNotification(userDoc.id, message, {
          doctorId,
          recipientRole: "doctor",
          ...extra
        }));
      }
    });
  } catch (err) {
    console.warn("Could not query doctor users for notification dispatch:", err);
  }

  const results = await Promise.all(promises);
  return results[0] || null;
};

/**
 * Broadcasts a notification to all hospital receptionists.
 */
export const notifyAllReceptionists = async (message, extra = {}) => {
  const promises = [];

  // General receptionist channel
  promises.push(createNotification("role_receptionist", message, {
    recipientRole: "receptionist",
    ...extra
  }));

  try {
    const recQ = query(collection(db, "users"), where("role", "in", ["receptionist", "admin"]));
    const recSnap = await getDocs(recQ);
    recSnap.forEach((docSnap) => {
      promises.push(createNotification(docSnap.id, message, {
        recipientRole: "receptionist",
        ...extra
      }));
    });
  } catch (err) {
    console.warn("Could not query individual receptionist accounts:", err);
  }

  await Promise.all(promises);
};

/**
 * Real-time listener for user notifications.
 * Supports patient, doctor (checking UID + doctorId), and receptionist.
 */
export const subscribeToNotifications = (userId, role = null, doctorId = null, callback) => {
  if (!userId) {
    callback([]);
    return () => {};
  }

  // Build target recipient IDs array based on role
  const targetIds = [userId];

  if (role === "doctor" || doctorId) {
    if (doctorId && !targetIds.includes(doctorId)) targetIds.push(doctorId);
    if (!targetIds.includes("role_doctor")) targetIds.push("role_doctor");
  }

  if (role === "receptionist" || role === "admin") {
    if (!targetIds.includes("role_receptionist")) targetIds.push("role_receptionist");
    if (!targetIds.includes("receptionist")) targetIds.push("receptionist");
  }

  const q = query(collection(db, "notifications"), where("recipientUid", "in", targetIds.slice(0, 10)));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const notifs = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
        timeMillis: d.data().timestamp?.toMillis ? d.data().timestamp.toMillis() : (d.data().createdAt?.toMillis ? d.data().createdAt.toMillis() : Date.now())
      }));
      // Sort newest first
      notifs.sort((a, b) => b.timeMillis - a.timeMillis);
      callback(notifs);
    },
    (error) => {
      console.warn("Real-time notification subscription fallback:", error);
      getNotificationsByUser(userId, doctorId).then(callback).catch(() => callback([]));
    }
  );

  return unsubscribe;
};

/**
 * One-time fetch for user notifications.
 */
export const getNotificationsByUser = async (userId, doctorId = null) => {
  if (!userId) return [];
  const targetIds = [userId];
  if (doctorId && !targetIds.includes(doctorId)) targetIds.push(doctorId);
  if (!targetIds.includes("role_receptionist")) targetIds.push("role_receptionist");

  try {
    const q = query(collection(db, "notifications"), where("recipientUid", "in", targetIds.slice(0, 10)));
    const snapshot = await getDocs(q);
    const notifications = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
      timeMillis: d.data().timestamp?.toMillis ? d.data().timestamp.toMillis() : 0
    }));
    return notifications.sort((a, b) => b.timeMillis - a.timeMillis);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    return [];
  }
};

/**
 * Marks a notification as read.
 */
export const markNotificationAsRead = async (notificationId) => {
  if (!notificationId) return;
  const ref = doc(db, "notifications", notificationId);
  return await updateDoc(ref, { 
    isRead: true, 
    readAt: Timestamp.now() 
  });
};
