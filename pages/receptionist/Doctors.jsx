import { useState, useEffect } from "react";
import { getDoctors, createDoctorProfile, updateDoctorProfile, deleteUser } from "../../services/userService";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { formatDoctorName } from "../../data/doctors";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Doctor Form State
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [doctorForm, setDoctorForm] = useState({
    name: "",
    email: "",
    specialization: "",
    experience: "",
    about: "",
    imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&q=80"
  });

  useEffect(() => {
    fetchDoctorsList();
  }, []);

  const fetchDoctorsList = async () => {
    setLoading(true);
    try {
      const docs = await getDoctors();
      setDoctors(docs);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorChange = (e) => {
    setDoctorForm({ ...doctorForm, [e.target.name]: e.target.value });
  };

  const openDoctorModal = (doc = null) => {
    if (doc) {
      setCurrentDoctor(doc);
      setDoctorForm(doc);
    } else {
      setCurrentDoctor(null);
      setDoctorForm({
        name: "", email: "", specialization: "", experience: "", about: "",
        imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&q=80"
      });
    }
    setIsDoctorModalOpen(true);
  };

  const saveDoctor = async (e) => {
    e.preventDefault();
    try {
      if (currentDoctor) {
        await updateDoctorProfile(currentDoctor.id, doctorForm);
      } else {
        await createDoctorProfile(doctorForm);
      }
      setIsDoctorModalOpen(false);
      fetchDoctorsList(); // Refresh list
    } catch (error) {
      console.error("Error saving doctor:", error);
    }
  };

  const removeDoctor = async (id) => {
    if (window.confirm("Are you sure you want to remove this doctor?")) {
      try {
        await deleteUser(id);
        setDoctors(doctors.filter(d => d.id !== id));
      } catch (error) {
        console.error("Error removing doctor", error);
      }
    }
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="text-xl text-medical-primary animate-pulse">Loading Doctors...</div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-800">Manage Doctors</h2>
        <button 
          onClick={() => openDoctorModal()} 
          className="bg-medical-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-medical-primary/90 transition-colors"
        >
          <Plus size={16} /> Add Doctor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map(doc => (
          <div key={doc.id} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-32 overflow-hidden">
              <img src={doc.imageUrl} alt={doc.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-900">{formatDoctorName(doc.name)}</h3>
              <p className="text-medical-primary font-medium text-sm">{doc.department || doc.specialization || doc.specialty}</p>
              <p className="text-gray-500 text-sm mt-1">{doc.experience} Experience &bull; {doc.location}</p>
              
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-50">
                <button 
                  onClick={() => openDoctorModal(doc)} 
                  className="text-gray-500 hover:text-medical-primary p-2 transition-colors"
                  title="Edit Doctor"
                >
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => removeDoctor(doc.id)} 
                  className="text-gray-500 hover:text-red-500 p-2 transition-colors"
                  title="Remove Doctor"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Doctor Modal */}
      {isDoctorModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-bold">{currentDoctor ? "Edit Doctor" : "Add New Doctor"}</h3>
              <button onClick={() => setIsDoctorModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={saveDoctor} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name (including Dr.)</label>
                <input required type="text" name="name" value={doctorForm.name} onChange={handleDoctorChange} className="w-full p-2 border rounded-lg focus:ring-medical-primary" />
              </div>
              {!currentDoctor && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (for login)</label>
                  <input required type="email" name="email" value={doctorForm.email} onChange={handleDoctorChange} className="w-full p-2 border rounded-lg focus:ring-medical-primary" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                <input required type="text" name="specialization" value={doctorForm.specialization} onChange={handleDoctorChange} className="w-full p-2 border rounded-lg focus:ring-medical-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                <input required type="text" name="experience" value={doctorForm.experience} onChange={handleDoctorChange} placeholder="e.g., 10+ Years" className="w-full p-2 border rounded-lg focus:ring-medical-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
                <textarea required name="about" value={doctorForm.about} onChange={handleDoctorChange} rows="3" className="w-full p-2 border rounded-lg focus:ring-medical-primary"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input required type="url" name="imageUrl" value={doctorForm.imageUrl} onChange={handleDoctorChange} className="w-full p-2 border rounded-lg focus:ring-medical-primary" />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsDoctorModalOpen(false)} className="flex-1 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-medical-primary text-white py-2 rounded-lg hover:bg-medical-primary/90 font-medium">
                  {currentDoctor ? "Save Changes" : "Create Doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
