import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

type NavItem = {
  label: string;
  path: string;
};

const navItems: NavItem[] = [
  { label: 'Meal Manager', path: '/meal-planner' },
  { label: 'Search History', path: '/search-history' },
  { label: 'Saved Restaurants', path: '/saved-restaurants' },
];

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="w-60 bg-[#d5a16e] p-5 min-h-screen font-[Comic_Sans_MS,cursive,sans-serif] shadow-md">
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
