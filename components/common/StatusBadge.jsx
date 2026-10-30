import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";

export default function StatusBadge({ status }) {
  switch(status) {
    case 'Confirmed': 
      return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><CheckCircle size={12}/> Confirmed</span>;
    case 'Pending': 
      return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><Clock size={12}/> Pending</span>;
    case 'Cancelled': 
      return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><XCircle size={12}/> Cancelled</span>;
    case 'Rescheduled': 
      return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><AlertCircle size={12}/> Rescheduled</span>;
    case 'Completed': 
      return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><CheckCircle size={12}/> Completed</span>;
    default: 
      return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold w-fit">{status}</span>;
  }
}
