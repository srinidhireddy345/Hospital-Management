import { useState, useEffect } from "react";
import { getAllHealthPackageBookings, updateHealthPackageBookingStatus } from "../../services/healthPackageService";
import { CheckCircle, XCircle } from "lucide-react";

export default function HealthPackages() {
  const [packageBookings, setPackageBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const pkgs = await getAllHealthPackageBookings();
      setPackageBookings(pkgs);
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePackageBookingStatus = async (pkg, status) => {
    try {
      await updateHealthPackageBookingStatus(pkg.id, status, pkg.patientId, pkg.packageName);
      setPackageBookings(packageBookings.map(p => p.id === pkg.id ? { ...p, status } : p));
    } catch (error) {
      console.error("Failed to update package booking status", error);
    }
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="text-xl text-medical-primary animate-pulse">Loading Health Packages...</div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-800">Health Package Requests</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 font-medium border-b">
            <tr>
              <th className="py-3 px-4">Patient</th>
              <th className="py-3 px-4">Package</th>
              <th className="py-3 px-4">Date Requested</th>
              <th className="py-3 px-4">Payment Info</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {packageBookings.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-4 text-center text-gray-500">No package requests found</td>
              </tr>
            ) : (
              packageBookings.map(pkg => (
                <tr key={pkg.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{pkg.patientName}</td>
                  <td className="py-3 px-4 text-gray-600 font-semibold">{pkg.packageName}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(pkg.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1">
                      {pkg.paymentStatus ? (
                        <span className={`px-2 py-1 w-fit rounded-full text-[10px] font-bold ${
                          pkg.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                          pkg.paymentStatus === 'PAY_AT_HOSPITAL' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {pkg.paymentStatus === 'PAY_AT_HOSPITAL' ? 'PAY AT HOSPITAL' : pkg.paymentStatus}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">No Payment Info</span>
                      )}
                      {pkg.paymentMethod && <span className="text-xs text-gray-500">{pkg.paymentMethod}</span>}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      pkg.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                      pkg.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {pkg.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      {pkg.status === 'Pending' && (
                        <button onClick={() => handlePackageBookingStatus(pkg, 'Confirmed')} className="text-green-600 hover:bg-green-50 p-1 rounded transition-colors" title="Confirm">
                          <CheckCircle size={18} />
                        </button>
                      )}
                      {(pkg.status === 'Pending' || pkg.status === 'Confirmed') && (
                        <button onClick={() => handlePackageBookingStatus(pkg, 'Cancelled')} className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors" title="Cancel">
                          <XCircle size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
