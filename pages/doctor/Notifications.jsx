import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { subscribeToNotifications } from "../../services/notificationService";
import NotificationList from "../../components/notifications/NotificationList";
import DOCTORS from "../../data/doctors";

export default function Notifications() {
  const { currentUser, userProfile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Doctor ID resolution
  const doctorId = useMemo(() => {
    if (userProfile?.doctorId) return userProfile.doctorId;
    const searchName = (userProfile?.name || currentUser?.displayName || "").replace(/^(dr\.?\s*)+/i, "").trim().toLowerCase();
    if (searchName) {
      const match = DOCTORS.find(d => d.name.toLowerCase().replace(/^(dr\.?\s*)+/i, "").trim().includes(searchName));
      if (match) return match.doctorId;
    }
    return "doc-01";
  }, [userProfile, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    const unsubscribe = subscribeToNotifications(currentUser.uid, "doctor", doctorId, (notifs) => {
      setNotifications(notifs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, doctorId]);

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="text-xl text-medical-primary animate-pulse font-medium">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Doctor Notifications</h1>
        <p className="text-gray-600 mt-1">Real-time alerts for appointments, patient cancellations, and schedule updates.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <NotificationList notifications={notifications} setNotifications={setNotifications} />
      </div>
    </div>
  );
}
