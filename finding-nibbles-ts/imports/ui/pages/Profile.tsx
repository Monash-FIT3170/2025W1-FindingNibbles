import React, { useState } from 'react';

import '../styling/profile.css';

export const Profile = () => {
  const [name, setName] = useState('Ubaid Irfan');
  const [email, setEmail] = useState('ubaidirfan@gmail.com');
  const [password, setPassword] = useState('********');
  const [preferences, setPreferences] = useState<string[]>(['Vegetarian', 'Vegan', 'Gluten-Free']);

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

  return (
    <div className="profile-container">

    {/* sidebar (temp) */}
  <div className="sidebar">
    <h2>Settings</h2>
    <button>Meal Planner</button>
    <button>Search History</button>
  </div>

  <div className="profile-content">
    {/* profile pic */}
    <div className="profile-picture">
        <img src="/images/default-profile-pic.png" alt="Profile" />
    </div>

    {/* name field */}
    <div className="profile-section">
      <input
        className="profile-input"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
    </div>

    {/* email field */}
    <div className="profile-section">
      <input
        className="profile-input"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
    </div>


    {/* password field */}
    <div className="profile-section">
      <input
        className="profile-input"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
    </div>


    {/* food preferences */}
    <div className="profile-section">
      <label style={{ marginBottom: '8px' }}><strong>Food Preferences:</strong></label>
      <div className="preference-list">
        {preferences.map((pref) => (
          <span key={pref} className="preference-item">
            {pref}
            <button onClick={() => handleRemovePreference(pref)}>x</button>
          </span>
        ))}
        <button className="add-pref-button" onClick={handleAddPreference}>+ Add Preference</button>
      </div>
    </div>
  </div>
</div>
  );
};