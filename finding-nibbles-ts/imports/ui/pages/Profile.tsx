import React, { useState } from 'react';

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
    <div className="flex flex-col md:flex-row min-h-screen font-[Comic_Sans_MS]">

      {/* sidebar (temp) */}
      <div className="w-full md:w-[240px] bg-[#d5a16e] flex flex-col p-5 shadow-md">
        <h2 className="text-white font-bold text-lg p-2 rounded-lg bg-[#b87b45] text-center mb-2">Settings</h2>
        <button className="text-white font-bold text-left text-base py-2">Meal Planner</button>
        <button className="text-white font-bold text-left text-base py-2">Search History</button>
      </div>

      <div className="flex flex-col flex-1 items-center p-6">
        {/* Profile Picture */}
        <div className="mb-6">
          <img src="/images/default-profile-pic.png" alt="Profile" className="w-20 h-20 rounded-full"/>
        </div>

        {/* name field */}
        <div className="flex flex-col items-center w-full max-w-md mb-5">
          <input
            className="w-full border-2 border-[#b87b45] rounded-xl py-2 px-4 text-center text-base mb-2"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* email field */}
        <div className="flex flex-col items-center w-full max-w-md mb-5">
          <input
            className="w-full border-2 border-[#b87b45] rounded-xl py-2 px-4 text-center text-base mb-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>


        {/* password field */}
        <div className="flex flex-col items-center w-full max-w-md mb-5">
          <input
            className="w-full border-2 border-[#b87b45] rounded-xl py-2 px-4 text-center text-base mb-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>


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
      </div>
    </div>
  );
};