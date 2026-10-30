import { useState, useEffect } from "react";
import { getDoctors } from "../../services/userService";
import { getAllAvailability, setDoctorAvailability, deleteDoctorAvailability } from "../../services/availabilityService";
import { Clock, Plus, Trash2 } from "lucide-react";
import { formatDoctorName, formatDateDisplay } from "../../data/doctors";

export default function DoctorAvailability() {
  const [doctors, setDoctors] = useState([]);
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    doctorId: "",
    date: "",
    startTime: "",
    endTime: "",
    duration: 30
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docs, avails] = await Promise.all([getDoctors(), getAllAvailability()]);
      setDoctors(docs);
      setAvailabilities(avails);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const doctor = doctors.find(d => (d.doctorId && d.doctorId === formData.doctorId) || d.id === formData.doctorId);
      await setDoctorAvailability({
        doctorId: formData.doctorId,
        doctorName: formatDoctorName(doctor?.name || "Unknown"),
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        duration: parseInt(formData.duration)
      });
      setMessage("Availability saved successfully.");
      setFormData({ ...formData, startTime: "", endTime: "" });
      fetchData();
    } catch (error) {
      console.error("Error saving availability:", error);
      setMessage("Failed to save availability.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this availability?")) {
      try {
        await deleteDoctorAvailability(id);
        setAvailabilities(availabilities.filter(a => a.id !== id));
      } catch (error) {
        console.error("Error deleting availability", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-xl text-medical-primary animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <Clock className="w-6 h-6 text-medical-primary" /> Manage Doctor Availability
      </h2>
      
      {message && (
        <div className={`p-4 rounded-md text-sm font-medium ${message.includes('Failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-700 mb-4 text-lg">Add New Availability</h3>
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
            <select required name="doctorId" value={formData.doctorId} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-medical-primary">
              <option value="">-- Select Doctor --</option>
              {doctors.map(doc => (
                <option key={doc.doctorId || doc.id} value={doc.doctorId || doc.id}>
                  {formatDoctorName(doc.name)} ({doc.department || doc.specialization || "General"})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input required type="date" name="date" min={new Date().toISOString().split("T")[0]} value={formData.date} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-medical-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slot Duration (mins)</label>
            <select required name="duration" value={formData.duration} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-medical-primary">
              <option value="15">15 minutes</option>
              <option value="20">20 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input required type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-medical-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input required type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-medical-primary" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full bg-medical-primary text-white py-2 rounded-lg hover:bg-medical-dark flex items-center justify-center gap-2">
              <Plus size={18} /> Save Availability
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-700 mb-4 text-lg">Existing Availability</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
              <tr>
                <th className="py-3 px-4">Doctor</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Start Time</th>
                <th className="py-3 px-4">End Time</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {availabilities.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-4 text-center text-gray-500">No availability records found.</td>
                </tr>
              ) : (
                availabilities.sort((a,b) => new Date(a.date) - new Date(b.date)).map(av => (
                  <tr key={av.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{formatDoctorName(av.doctorName)}</td>
                    <td className="py-3 px-4 text-gray-600">{formatDateDisplay(av.date)}</td>
                    <td className="py-3 px-4 text-gray-600">{av.startTime}</td>
                    <td className="py-3 px-4 text-gray-600">{av.endTime}</td>
                    <td className="py-3 px-4 text-gray-600">{av.duration} mins</td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => handleDelete(av.id)} className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
