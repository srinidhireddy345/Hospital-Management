import { Bell } from "lucide-react";
import { markNotificationAsRead } from "../../services/notificationService";

export default function NotificationList({ notifications, setNotifications }) {
  const handleMarkRead = async (id) => {
    await markNotificationAsRead(id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-lg font-bold mb-4 text-medical-dark flex items-center gap-2 border-b pb-2">
        <Bell className="w-5 h-5 text-medical-primary" /> Notifications
      </h2>
      {notifications.length === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center">No new notifications.</p>
      ) : (
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
          {notifications.map(n => (
            <div key={n.id} className={`p-3 rounded-lg border text-sm ${n.isRead ? 'bg-gray-50 border-gray-100' : 'bg-teal-50 border-teal-200'}`}>
              <p className="text-gray-800">{n.message}</p>
              {!n.isRead && (
                <button onClick={() => handleMarkRead(n.id)} className="text-xs text-medical-primary mt-2 font-medium hover:underline">
                  Mark as read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
