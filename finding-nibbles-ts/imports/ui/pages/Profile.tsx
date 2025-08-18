import React, { useState, useRef, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import type {CustomUser} from '../types/User.ts';
import { useNavigate } from 'react-router-dom';
import AddPreferenceModal from '../components/profile/AddPreferenceModal';
import { useTracker } from 'meteor/react-meteor-data';

export const Profile = () => {
  const user = useTracker(() => Meteor.user() as CustomUser);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState(user?.profile?.name || '');
  const [email, setEmail] = useState(user?.emails?.[0]?.address || '');
  const [password, setPassword] = useState('');
  const [preferences, setPreferences] = useState<string[]>(user?.profile?.preferences || []);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const [profileImage, setProfileImage] = useState<string>(
    user?.profile?.profileImage || '/images/default-profile-pic.png'
  );

  useEffect(() => {
    setProfileImage(user?.profile?.profileImage || '/images/default-profile-pic.png');
  }, [user?.profile?.profileImage]);


  const handleRemovePreference = (pref: string) => {
    setPreferences(preferences.filter(p => p !== pref));
  };

  const handleAddClick = () => {
    setModalOpen(true);
  };

  const handleAddPreference = (newPref: string) => {  
    if (newPref && !preferences.includes(newPref)) {
      setPreferences([...preferences, newPref]);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image size must be less than 5MB.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setUploadingImage(true);
    setMessage('');

    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = (e.target?.result as string).split(',')[1];


      Meteor.call(
        'users.uploadProfileImage',
        {
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64Data
        },
        (err: Meteor.Error | undefined) => {
          setUploadingImage(false);
          if (err) {
            setMessage(`Failed to upload image: ${err.reason}`);
            // Revert to previous image
          } else {
            setProfileImage(`data:${file.type};base64,${base64Data}`);
            setMessage('Profile image updated successfully!');
            setTimeout(() => setMessage(''), 3000);
          }
        }
      );
    };
    reader.readAsDataURL(file);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = () => {
    setLoading(true);
    setMessage('');
    
    Meteor.call(
      'users.updateProfile',
      { name, email, preferences },
      (err: Meteor.Error | undefined) => {
        setLoading(false);
        if (err) {
          setMessage(`Failed to save profile: ${err.reason}`);
        } else {
          setMessage('Profile updated successfully!');
          setTimeout(() => setMessage(''), 3000);
        }
      }
    );
  };
  
  return (
    <div className="min-h-screen pt-20 bg-[#fdfaf7] p-6" style={{ fontFamily: '"Comic Sans MS", cursive, sans-serif' }}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[#4b2e19] mb-8">Profile Settings</h1>
  
        <div className="bg-white rounded-2xl shadow-lg border border-[#e2cfc3] p-8">
          {/* Profile Avatar */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <img
                src={profileImage}
                alt="Profile"
                className={`w-24 h-24 rounded-full border-4 border-[#C47B4D] shadow-lg object-cover transition-opacity ${
                  uploadingImage ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'
                }`}
                onClick={uploadingImage ? undefined : handleImageClick}
              />
              <button 
                className="absolute bottom-0 right-0 bg-[#C47B4D] text-white p-2 rounded-full hover:bg-[#A35F35] transition-colors disabled:opacity-50"
                onClick={handleImageClick}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                )}
              </button>
              {uploadingImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadingImage}
              />
            </div>
          </div>

          {/* Upload Instructions */}
          <div className="text-center mb-6">
            <p className="text-sm text-[#7a5c43]">
              Click on your profile picture to upload a new one
            </p>
            <p className="text-xs text-[#7a5c43] opacity-70 mt-1">
              Supported formats: JPG, PNG, GIF (max 5MB)
            </p>
            {uploadingImage && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700">
                  Uploading image... Please wait.
                </p>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#4b2e19] mb-2">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-[#e2cfc3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C47B4D] focus:border-[#C47B4D] transition-all duration-200 text-[#4b2e19] bg-[#fff9f4]"
                placeholder="Enter your display name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#4b2e19] mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-[#e2cfc3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C47B4D] focus:border-[#C47B4D] transition-all duration-200 text-[#4b2e19] bg-[#fff9f4]"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#4b2e19] mb-2">New Password (optional)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-[#e2cfc3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C47B4D] focus:border-[#C47B4D] transition-all duration-200 text-[#4b2e19] bg-[#fff9f4]"
                placeholder="Leave blank to keep current password"
              />
            </div>

            {/* Food Preferences */}
            <div>
              <label className="block text-sm font-medium text-[#4b2e19] mb-2">Food Preferences</label>
              <div className="border-2 border-[#e2cfc3] rounded-lg p-4 bg-[#fff9f4] min-h-[80px]">
                <div className="flex flex-wrap gap-2 mb-4">
                  {preferences.length === 0 && (
                    <span className="text-[#7a5c43] opacity-70 italic">No preferences added yet.</span>
                  )}
                  {preferences.map((pref) => (
                    <span 
                      key={pref} 
                      className="inline-flex items-center px-3 py-1 bg-[#C47B4D] text-white text-sm rounded-full hover:bg-[#A35F35] transition-colors"
                    >
                      {pref}
                      <button 
                        onClick={() => handleRemovePreference(pref)} 
                        className="ml-2 text-white hover:text-red-200 font-bold text-lg leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <button 
                  onClick={handleAddClick} 
                  className="inline-flex items-center px-4 py-2 bg-[#fff9f4] border-2 border-dashed border-[#C47B4D] text-[#C47B4D] rounded-lg hover:bg-[#C47B4D] hover:text-white transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Preference
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading}
              className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[#C47B4D] hover:bg-[#A35F35] focus:outline-none focus:ring-2 focus:ring-[#C47B4D] focus:ring-offset-2 transform hover:scale-105'
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>

          {/* Message */}
          {message && (
            <div className={`mt-4 p-3 rounded-lg text-center ${
              message.includes('Failed') 
                ? 'bg-red-100 border border-red-400 text-red-700' 
                : 'bg-green-100 border border-green-400 text-green-700'
            }`}>
              {message}
            </div>
          )}
        </div>
        
        {/* Add Preference Modal */}
        <AddPreferenceModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onAdd={handleAddPreference}
          enableSelectList={true}
          enableCustomInput={true}
        />
      </div>
    </div>
  );
};