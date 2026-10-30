import { useState } from "react";
import { Upload, FileText } from "lucide-react";
import { uploadMedicalRecord } from "../../services/medicalRecordService";
import { useAuth } from "../../context/AuthContext";

export default function MedicalRecordUpload({ onUploadSuccess }) {
  const { currentUser } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      await uploadMedicalRecord(currentUser.uid, file);
      setSuccessMsg("Record uploaded successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
      setFile(null);
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || "Failed to upload record.");
      setTimeout(() => setErrorMsg(""), 3000);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-lg font-bold mb-4 text-medical-dark flex items-center gap-2 border-b pb-2">
        <FileText className="w-5 h-5 text-medical-primary" /> Medical Records
      </h2>
      
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded mb-4 text-sm" role="alert">
          {successMsg}
        </div>
      )}
      
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-4 text-sm" role="alert">
          {errorMsg}
        </div>
      )}
      
      <form onSubmit={handleFileUpload} className="mb-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
          <input 
            type="file" 
            id="record-upload" 
            className="hidden" 
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <label htmlFor="record-upload" className="cursor-pointer flex flex-col items-center">
            <Upload className="w-6 h-6 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600 font-medium">
              {file ? file.name : "Click to select file (PDF, Image)"}
            </span>
          </label>
        </div>
        {file && (
          <button 
            type="submit" 
            disabled={uploading}
            className="w-full mt-3 bg-medical-primary text-white py-2 rounded-md text-sm font-medium disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload File"}
          </button>
        )}
      </form>
    </div>
  );
}
