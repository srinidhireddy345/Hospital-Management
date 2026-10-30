import { Activity } from "lucide-react";
import StatusBadge from "../common/StatusBadge";

export default function HealthPackageList({ healthPackageBookings }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold mb-6 text-medical-dark border-b pb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-medical-primary" /> Health Checkup Bookings
      </h2>
      {healthPackageBookings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Activity className="w-10 h-10 mx-auto text-gray-300 mb-2" />
          <p>No health checkups booked yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {healthPackageBookings.map((booking) => (
            <div key={booking.id} className="border border-gray-100 rounded-lg p-4 flex flex-col md:flex-row justify-between md:items-center hover:border-medical-primary transition-colors bg-gray-50">
              <div>
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  {booking.packageName}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  <span className="font-medium text-medical-primary">{new Date(booking.preferredDate).toLocaleDateString()}</span> at <span className="font-medium">{booking.preferredTime}</span>
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-gray-500 text-xs">Price: <span className="font-semibold text-gray-800">{booking.price}</span></p>
                  {booking.paymentMethod && (
                    <p className="text-gray-500 text-xs">Method: <span className="font-semibold text-gray-800">{booking.paymentMethod}</span></p>
                  )}
                  {booking.transactionId && booking.transactionId !== "N/A" && (
                    <p className="text-gray-500 text-xs">Txn ID: <span className="font-semibold text-gray-800">{booking.transactionId}</span></p>
                  )}
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex flex-col items-end gap-2">
                <StatusBadge status={booking.status} />
                {booking.paymentStatus && (
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    booking.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                    booking.paymentStatus === 'PAY_AT_HOSPITAL' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.paymentStatus === 'PAY_AT_HOSPITAL' ? 'Pay at Hospital' : booking.paymentStatus}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
