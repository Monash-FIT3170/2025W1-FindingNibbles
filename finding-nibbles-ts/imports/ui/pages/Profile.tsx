import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import type {CustomUser} from '../types/User.ts';
import Button from '@mui/material/Button';
import '../styling/profile-form.css';
import { TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {Sidebar} from '../components/layouts/Sidebar.tsx';
import { Box } from '@mui/material';
import AddPreferenceModal from '../components/profile/AddPreferenceModal';


export const Profile = () => {
  const user = Meteor.user() as CustomUser;
  const navigate = useNavigate();
  
  const [name, setName] = useState(user?.profile?.name || '');
  const [email, setEmail] = useState(user?.emails?.[0]?.address || '');
  const [password, setPassword] = useState('********');
  const [preferences, setPreferences] = useState<string[]>(user?.profile?.preferences || []);
  const [modalOpen, setModalOpen] = useState(false);


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

  const handleSave = () => {
    Meteor.call(
      'users.updateProfile',
      { name, email, preferences },
      (err: Meteor.Error | undefined) => {
        if (err) {
          alert(`Failed to save profile: ${err.reason}`);
        } else {
          alert('Profile updated successfully!');
        }
      }
    );
  };
  
  return (
    <div className="profile-container">
      <Sidebar />
  
      <div className="profile-wrapper">
        <h2 className="profile-heading">Profile Settings</h2>
  
        <img
          src="/images/default-profile-pic.png"
          alt="Profile"
          className="profile-avatar"
        />
  
        <Box className="form-container">
          <TextField
            label="Display Name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-input"
            fullWidth
          />
          <TextField
            label="Email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-input"
            fullWidth
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-input"
            fullWidth
          />

          <div className="profile-preferences-label">Food Preferences:</div>
          <div className="profile-preferences-box" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                border: '2px solid #b87b45',
                borderRadius: '16px',
                padding: '12px 16px',
                background: '#fff',
                marginBottom: '8px',
                minHeight: '44px',
                alignItems: 'center',
              }}
            >
              {preferences.length === 0 && (
                <span style={{ color: '#b87b45', opacity: 0.7, fontSize: '0.95em' }}>No preferences added yet.</span>
              )}
              {preferences.map((pref) => (
                <span key={pref} className="preference-chip">
                  {pref}
                  <button onClick={() => handleRemovePreference(pref)} className="preference-remove">x</button>
                </span>
              ))}
            </div>
            <button onClick={handleAddClick} className="preference-add">+ Add Preference</button>
          </div>
  
          <Button
            variant="contained"
            onClick={handleSave}
            className="profile-save-button"
          >
            Save Changes
          </Button>
        </Box>
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

}