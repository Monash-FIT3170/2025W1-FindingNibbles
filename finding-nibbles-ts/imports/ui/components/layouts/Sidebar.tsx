import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styling/Sidebar.css'; 

const navItems = [
  { label: 'Settings', path: '/profile' },
  { label: 'Meal Planner', path: '/meal-planner' },
  { label: 'Search History', path: '/search-history' },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="sidebar-container">
      {navItems.map((item) => (
        <button
          key={item.path}
          className={`sidebar-button ${
            location.pathname === item.path ? 'active' : ''
          }`}
          onClick={() => navigate(item.path)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};
