import { useState, useEffect } from "react";
import { subscribeToNotifications } from "../../services/notificationService";
import { useAuth } from "../../context/AuthContext";
import NotificationList from "../../components/notifications/NotificationList";

export default function Notifications() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    const unsubscribe = subscribeToNotifications(currentUser.uid, "patient", null, (notifs) => {
      setNotifications(notifs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="text-xl text-medical-primary animate-pulse font-medium">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600 mt-1">Real-time alerts for booking confirmations, cancellations, and appointment reminders.</p>
      </div>
      <NotificationList notifications={notifications} setNotifications={setNotifications} />
    </div>
  );
}
