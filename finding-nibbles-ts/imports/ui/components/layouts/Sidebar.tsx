import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import type {CustomUser} from '../../types/User';


type NavItem = {
  label: string;
  path: string;
};

const navItems: NavItem[] = [
  { label: 'Meal Manager', path: '/meal-planner' },
  { label: 'Search History', path: '/search-history' },
  // { label: 'Saved Restaurants', path: '/travel-planning' },
];

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

      // Track the logged-in user
  const user = useTracker(() => Meteor.user() as CustomUser | null);

  const [profileImage, setProfileImage] = useState(
    user?.profile?.profileImage || '/images/default-profile-pic.png'
  );

  useEffect(() => {
    setProfileImage(user?.profile?.profileImage || '/images/default-profile-pic.png');
  }, [user?.profile?.profileImage]);


  return (
    <div className="w-60 bg-[#d5a16e] px-5 pb-5 min-h-full font-[Comic_Sans_MS,cursive,sans-serif] shadow-md">
      {/* Profile picture */}
      <div className="w-16 h-16 rounded-full overflow-hidden mt-4 mb-6 border-2 border-white mx-auto">
        <img
          src={profileImage}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      </div>
      
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className={`w-full px-4 py-3 text-white font-bold text-base text-left rounded-lg transition-colors duration-200
            ${location.pathname === item.path ? 'bg-[#b87b45]' : 'hover:bg-[#b87b45]'}`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};
