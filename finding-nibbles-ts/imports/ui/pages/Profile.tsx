import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import type {CustomUser} from '../types/User.ts';
import Button from '@mui/material/Button';
import '../styling/profile-form.css';
import { TextField } from '@mui/material';


export const Profile = () => {
  // const [name, setName] = useState('Ubaid Irfan');
  // const [email, setEmail] = useState('ubaidirfan@gmail.com');
  // const [password, setPassword] = useState('********');
  // const [preferences, setPreferences] = useState<string[]>(['Vegetarian', 'Vegan', 'Gluten-Free']);

  const user = Meteor.user() as CustomUser;
  const [name, setName] = useState(user?.profile?.name || '');
  const [email, setEmail] = useState(user?.emails?.[0]?.address || '');
  const [password, setPassword] = useState('********');
  const [preferences, setPreferences] = useState<string[]>(user?.profile?.preferences || []);


  //removing food preferences from list
    const handleRemovePreference = (pref: string) => {
    setPreferences(preferences.filter(p => p !== pref));
  };

  //add food pref to list
    const handleAddPreference = () => {
    const newPref = prompt('Enter new food preference:');
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
    <div className="flex flex-col md:flex-row min-h-screen font-[Comic_Sans_MS]">

      {/* sidebar (temp) */}
      <div className="w-full md:w-[240px] bg-[#d5a16e] flex flex-col p-5 shadow-md">
        <h2 className="text-white font-bold text-lg p-2 rounded-lg bg-[#b87b45] text-center mb-2">Settings</h2>
        <button className="text-white font-bold text-left text-base py-2">Meal Planner</button>
        <button className="text-white font-bold text-left text-base py-2">Search History</button>
      </div>

      <div className="flex flex-col flex-1 items-center p-6">
      {/*  Profile Picture */}
        <div>
          <img src="/images/default-profile-pic.png" alt="Profile" className="profile-image" />
        </div>

        {/* Name Field */}
        <TextField
          label="Display Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          variant="outlined"
          className="profile-field"
          InputProps={{ style: { borderRadius: 16 } }}
        />

        {/* Email Field */}
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          variant="outlined"
          type="email"
          className="profile-field"
          InputProps={{ style: { borderRadius: 16 } }}
        />

        {/* Password Field */}
        <TextField
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          variant="outlined"
          type="password"
          className="profile-field"
          InputProps={{ style: { borderRadius: 16 } }}
        />

        {/* food preferences */}
        <div className="flex flex-col items-center w-full max-w-md">
          <label className="mb-2 font-semibold">Food Preferences:</label>
          <div className="flex flex-wrap gap-2 border-2 border-[#b87b45] rounded-xl py-3 px-5 w-full justify-start">
            {preferences.map((pref) => (
              <span key={pref} className="bg-[#d5a16e] text-white rounded-full px-4 py-1 text-sm flex items-center">
                {pref}
                <button onClick={() => handleRemovePreference(pref)} className="ml-2 font-bold hover:text-[#b87b45]">x</button>
              </span>
            ))}
            <button onClick={handleAddPreference} className="text-[#b87b45] font-bold text-sm hover:underline">+ Add Preference</button>
          </div>
        </div>

        <Button
          variant="contained"
          onClick={handleSave}
          className="save-button"
        >
          Save Changes
        </Button>

      </div>
    </div>
  );
};