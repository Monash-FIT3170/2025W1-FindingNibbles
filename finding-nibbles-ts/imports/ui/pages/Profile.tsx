import React, { useState, useRef, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import type {CustomUser} from '../types/User';
// removed unused useNavigate import
import AddPreferenceModal from '../components/profile/AddPreferenceModal';
import { useTracker } from 'meteor/react-meteor-data';
import { Accounts } from 'meteor/accounts-base';

export const Profile = () => {
  const user = useTracker(() => Meteor.user() as CustomUser);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState(user?.profile?.name || '');
  const [email, setEmail] = useState(user?.emails?.[0]?.address || '');
  // removed unused password state
  const [preferences, setPreferences] = useState<string[]>(user?.profile?.preferences || []);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const [profileImage, setProfileImage] = useState<string>(
    user?.profile?.profileImage || '/images/default-profile-pic.png'
  );

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  // Add these to your Profile component's state
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
    // Minimal client-side validation: show a simple message when email is invalid.
    const emailTrim = (email || '').trim();
    // Simple check: require a valid email that ends with .com
    const emailRegex = /^[\w.+\-]+@[A-Za-z0-9\-]+(\.[A-Za-z0-9\-]+)*\.com$/i;
    if (emailTrim && !emailRegex.test(emailTrim)) {
      setLoading(false);
      setMessage('Email is not valid');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    Meteor.call(
      'users.updateProfile',
      { name, email: emailTrim, preferences },
      (err: Meteor.Error | undefined) => {
        setLoading(false);
        if (err) {
          setMessage(`Failed to save profile: ${err.reason || err.message}`);
        } else {
          setMessage('Profile updated successfully!');
          setTimeout(() => setMessage(''), 3000);
        }
      }
    );
  };

  const handleChangePassword = () => {
    setPasswordMessage('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage('New passwords do not match.');
      return;
    }
    Accounts.changePassword(currentPassword, newPassword, (err) => {
      if (err) {
        // Prefer Meteor.Error.reason, else fallback to message or default
        const errorMsg =
          (typeof (err as any).reason === 'string' && (err as any).reason) ||
          err.message ||
          'Failed to change password.';
        setPasswordMessage(errorMsg);
      } else {
        setPasswordMessage('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordMessage(''), 3000);
      }
    });
  };
  
  // Password validation
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const hasLength = newPassword.length >= 8;
  const isStrong = hasUppercase && hasNumber && hasLength;

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
        
        {/* Change Password Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#e2cfc3] p-8 mt-8">
          <h2 className="text-xl font-semibold mb-2 text-[#4b2e19]">Change Password</h2>
          <br></br>
          <div className="space-y-4">
            {/* Current Password */}
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Current Password"
                className="w-full px-4 py-3 border border-[#e2cfc3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C47B4D] focus:border-[#C47B4D] transition-all duration-200 text-[#4b2e19] bg-[#fff9f4] pr-12"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#C47B4D] hover:text-[#A35F35]"
                onClick={() => setShowCurrent(v => !v)}
                tabIndex={-1}
              >
                {showCurrent ? (
                  // Eye open
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  // Eye closed
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                  </svg>
                )}
              </button>
            </div>
            {/* New Password */}
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="New Password"
                className="w-full px-4 py-3 border border-[#e2cfc3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C47B4D] focus:border-[#C47B4D] transition-all duration-200 text-[#4b2e19] bg-[#fff9f4] pr-12"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#C47B4D] hover:text-[#A35F35]"
                onClick={() => setShowNew(v => !v)}
                tabIndex={-1}
              >
                {showNew ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                  </svg>
                )}
              </button>
            </div>
            {/* Confirm New Password */}
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
                className="w-full px-4 py-3 border border-[#e2cfc3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C47B4D] focus:border-[#C47B4D] transition-all duration-200 text-[#4b2e19] bg-[#fff9f4] pr-12"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#C47B4D] hover:text-[#A35F35]"
                onClick={() => setShowConfirm(v => !v)}
                tabIndex={-1}
              >
                {showConfirm ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                  </svg>
                )}
              </button>
            </div>

            {/* Password Strength */}
            <div className="flex flex-col gap-1 text-xs mt-2">
              <span className={hasUppercase ? "text-green-600" : "text-red-600"}>
                <span className="mr-1">{hasUppercase ? "✔" : "✖"}</span>
                At least 1 uppercase
              </span>
              <span className={hasNumber ? "text-green-600" : "text-red-600"}>
                <span className="mr-1">{hasNumber ? "✔" : "✖"}</span>
                At least 1 number
              </span>
              <span className={hasLength ? "text-green-600" : "text-red-600"}>
                <span className="mr-1">{hasLength ? "✔" : "✖"}</span>
                At least 8 characters
              </span>
            </div>

            {/* Feedback Message */}
            {passwordMessage && (
              <div className={`mt-4 p-3 rounded-lg text-center ${
                passwordMessage.toLowerCase().includes('success')
                  ? 'bg-green-100 border border-green-400 text-green-700'
                  : 'bg-red-100 border border-red-400 text-red-700'
              }`}>
                {passwordMessage}
              </div>
            )}

            {/* Buttons */}
            <div className="mt-8 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordMessage('');
                }}
                className="px-8 py-3 rounded-lg font-semibold text-[#C47B4D] border border-[#C47B4D] bg-white hover:bg-[#fff9f4] transition-all duration-200"
              >
                Discard
              </button>
              <button
                onClick={handleChangePassword}
                disabled={!isStrong}
                className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                  !isStrong
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#C47B4D] hover:bg-[#A35F35] focus:outline-none focus:ring-2 focus:ring-[#C47B4D] focus:ring-offset-2 transform hover:scale-105'
                }`}
              >
                Apply Changes
              </button>
            </div>
          </div>
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