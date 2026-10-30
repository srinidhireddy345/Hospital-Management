import { useState, useEffect } from "react";
import { getHealthPackageBookingsByPatient } from "../../services/healthPackageService";
import { useAuth } from "../../context/AuthContext";
import HealthPackageList from "../../components/health-packages/HealthPackageList";

export default function HealthPackageBookings() {
  const { currentUser } = useAuth();
  const [healthPackageBookings, setHealthPackageBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      getHealthPackageBookingsByPatient(currentUser.uid).then((hpBookings) => {
        hpBookings.sort((a, b) => new Date(b.preferredDate) - new Date(a.preferredDate));
        setHealthPackageBookings(hpBookings);
        setLoading(false);
      });
    }
  }, [currentUser]);

  if (loading) return <div>Loading bookings...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Health Package Bookings</h1>
      <HealthPackageList healthPackageBookings={healthPackageBookings} />
    </div>
  );
}
