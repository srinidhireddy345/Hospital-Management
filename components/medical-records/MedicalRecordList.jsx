import { FileText } from "lucide-react";

export default function MedicalRecordList({ records }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">My Files</h3>
      {records.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-2">No records uploaded.</p>
      ) : (
        records.map(rec => (
          <a key={rec.id} href={rec.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-md bg-gray-50 hover:bg-gray-100 border border-gray-100 group transition-colors">
            <FileText className="w-5 h-5 text-medical-primary group-hover:text-medical-dark" />
            <span className="text-sm text-gray-800 truncate flex-1">{rec.fileName}</span>
          </a>
        ))
      )}
    </div>
  );
}
