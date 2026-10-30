import { useState, useEffect } from "react";
import { getUserProfile, updateUserProfile } from "../services/userService";
import { useAuth } from "../context/AuthContext";
import { UserCircle, Save, X } from "lucide-react";
import { getYesterdayDateString, isPastDOB, DOB_ERROR_MESSAGE } from "../utils/dobValidation";

export default function Profile() {
  const { currentUser, setUserProfile: setGlobalUserProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [dobError, setDobError] = useState("");

  useEffect(() => {
    if (currentUser) {
      fetchProfile();
    }
  }, [currentUser]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const userProf = await getUserProfile(currentUser.uid);
      setProfile(userProf);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setProfileForm(profile || {
      name: currentUser.displayName || "",
      phone: "",
      dob: "",
      bloodGroup: "",
      address: ""
    });
    setDobError("");
    setProfilePhotoFile(null);
    setIsEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));

    if (name === "dob") {
      if (value) {
        if (!isPastDOB(value)) {
          setDobError(DOB_ERROR_MESSAGE);
          setErrorMsg(DOB_ERROR_MESSAGE);
        } else {
          setDobError("");
          if (errorMsg === DOB_ERROR_MESSAGE) {
            setErrorMsg("");
          }
        }
      } else {
        setDobError("");
        if (errorMsg === DOB_ERROR_MESSAGE) {
          setErrorMsg("");
        }
      }
    }
  };

  const NAME_REGEX = /^[A-Za-z]+(?:\s+[A-Za-z]+)*$/;

  const handleSave = async () => {
    const trimmedName = profileForm.name ? profileForm.name.trim() : "";
    if (trimmedName && !NAME_REGEX.test(trimmedName)) {
      setErrorMsg("Name must contain alphabets only.");
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }

    if (profileForm.dob && !isPastDOB(profileForm.dob)) {
      setDobError(DOB_ERROR_MESSAGE);
      setErrorMsg(DOB_ERROR_MESSAGE);
      setTimeout(() => setErrorMsg(""), 4000);
      return;
    }
    setDobError("");

    setSaving(true);
    try {
      await updateUserProfile(currentUser.uid, { ...profileForm, name: trimmedName }, profilePhotoFile);
      const updatedProfile = await getUserProfile(currentUser.uid);
      setProfile(updatedProfile);
      setGlobalUserProfile(updatedProfile);
      setIsEditing(false);
      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || "Failed to update profile.");
      setTimeout(() => setErrorMsg(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-medical-dark">My Profile</h1>
      
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{successMsg}</span>
        </div>
      )}
      
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{errorMsg}</span>
        </div>
      )}

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-xl font-bold text-medical-dark flex items-center gap-2">
            <UserCircle className="w-6 h-6 text-medical-primary" /> Personal Information
          </h2>
          {!isEditing && (
            <button onClick={handleEdit} className="text-medical-primary font-medium hover:underline bg-medical-primary/10 px-4 py-2 rounded-md">
              Edit Profile
            </button>
          )}
        </div>
        
        {isEditing ? (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo (Max 500KB)</label>
              <input type="file" accept="image/*" onChange={e => setProfilePhotoFile(e.target.files[0])} className="text-sm text-gray-500 w-full p-2 border rounded-md bg-gray-50" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" name="name" value={profileForm.name} onChange={handleChange} className="w-full border-gray-300 rounded-md p-2 focus:ring-medical-primary focus:border-medical-primary border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" name="phone" value={profileForm.phone} onChange={handleChange} className="w-full border-gray-300 rounded-md p-2 focus:ring-medical-primary focus:border-medical-primary border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input 
                  type="date" 
                  name="dob" 
                  max={getYesterdayDateString()}
                  value={profileForm.dob || ""} 
                  onChange={handleChange} 
                  className={`w-full rounded-md p-2 focus:ring-medical-primary focus:border-medical-primary border ${dobError ? "border-red-500" : "border-gray-300"}`} 
                />
                {dobError && <p className="text-xs text-red-600 mt-1">{dobError}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                <input type="text" name="bloodGroup" value={profileForm.bloodGroup} onChange={handleChange} className="w-full border-gray-300 rounded-md p-2 focus:ring-medical-primary focus:border-medical-primary border" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea name="address" value={profileForm.address} onChange={handleChange} className="w-full border-gray-300 rounded-md p-2 focus:ring-medical-primary focus:border-medical-primary border" rows={3}></textarea>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button onClick={() => setIsEditing(false)} disabled={saving} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <X size={16} /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-medical-primary text-white rounded-md text-sm font-medium hover:bg-medical-dark flex items-center gap-2 disabled:opacity-50">
                <Save size={16} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center border-4 border-white shadow-md overflow-hidden shrink-0">
              {profile?.photoUrl ? (
                <img src={profile.photoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserCircle size={64} className="text-gray-400" />
              )}
            </div>
            <div className="space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Name</p>
                  <p className="text-gray-900 font-medium text-lg">{profile?.name || currentUser.displayName || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Email</p>
                  <p className="text-gray-900">{currentUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Phone</p>
                  <p className="text-gray-900">{profile?.phone || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Date of Birth</p>
                  <p className="text-gray-900">{profile?.dob || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Blood Group</p>
                  <p className="text-gray-900">{profile?.bloodGroup || "Not provided"}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-gray-500 font-medium">Address</p>
                  <p className="text-gray-900">{profile?.address || "Not provided"}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
