import React, { useState } from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import type { CustomUser } from "../../types/User";

const bunnyIcon = "./images/bunnyIcon.png";

// SVG Icons as components
const MapIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
);

const AIIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const DiscoverIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
  </svg>
);

const MealIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H19M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const TravelIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
);

const ProfileIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = useTracker(() => !!Meteor.userId(), []);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = useTracker(() => Meteor.user() as CustomUser | null, []);
  const userName = user?.profile?.name || "User";

  // Navigation items for logged-in users
  const navItems = [
    { label: "Map", path: "/map", icon: <MapIcon /> },
    { label: "AI Suggestion", path: "/ai-suggestion", icon: <AIIcon /> },
    { label: "Discover", path: "/discover", icon: <DiscoverIcon /> },
    { label: "Meal Planner", path: "/meal-planner", icon: <MealIcon /> },
    { label: "Travel Plans", path: "/travel-plans", icon: <TravelIcon /> },
  ];

  const isCurrentPage = (path: string) => {
    const currentPath = location.pathname;
    if (path === "/map" && (currentPath === "/" || currentPath === "/map")) return true;
    
    // Keep meal planner highlighted when on related sidebar pages
    if (path === "/meal-planner" && (
      currentPath === "/meal-planner" ||
      currentPath === "/search-history" ||
      currentPath === "/saved-restaurants"
    )) return true;
    
    return currentPath === path;
  };

  const handleLogout = () => {
    Meteor.logout(() => {
      navigate("/login");
    });
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Main Navigation Bar */}
      <nav className="bg-[#C47B4D] shadow-lg relative z-50" style={{ fontFamily: '"Comic Sans MS", cursive, sans-serif' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <RouterLink to="/" className="flex items-center space-x-3">
                <img
                  src={bunnyIcon}
                  alt="Bunny Icon"
                  className="w-8 h-8 object-contain"
                />
                <span className="text-white font-bold text-xl">
                  Finding Nibbles
                </span>
              </RouterLink>
            </div>

            {/* Desktop Navigation */}
            {isLoggedIn && (
              <div className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => (
                  <RouterLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isCurrentPage(item.path)
                        ? "bg-[#A35F35] text-white font-bold"
                        : "text-white text-opacity-80 hover:text-white hover:bg-[#A35F35] hover:font-semibold"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </RouterLink>
                ))}
              </div>
            )}

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {!isLoggedIn ? (
                <>
                  <RouterLink
                    to="/login"
                    className="text-white text-opacity-90 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Login
                  </RouterLink>
                  <RouterLink
                    to="/register"
                    className="text-white text-opacity-90 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Register
                  </RouterLink>
                </>
              ) : (
                <>
                  {/* Mobile Menu Button */}
                  <button
                    onClick={toggleMobileMenu}
                    className="md:hidden text-white p-2 hover:bg-[#A35F35] rounded-lg transition-colors"
                  >
                    {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                  </button>

                  {/* Profile Button */}
                  <button
                    onClick={toggleDrawer}
                    className="text-white hover:bg-[#A35F35] p-2 rounded-lg transition-colors"
                  >
                    <ProfileIcon />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isLoggedIn && isMobileMenuOpen && (
            <div className="md:hidden border-t border-white border-opacity-20">
              <div className="py-2 space-y-1">
                {navItems.map((item) => (
                  <RouterLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      isCurrentPage(item.path)
                        ? "bg-[#A35F35] text-white border-l-4 border-[#8B4A2B] font-bold"
                        : "text-white text-opacity-80 hover:text-white hover:bg-[#A35F35] hover:font-semibold"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </RouterLink>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Profile Drawer */}
      {isDrawerOpen && (
        <div className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-80 bg-[#d5a16e] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l-2 border-[#C47B4D]">
            <div className="h-full flex flex-col p-6">
              {/* Close Button */}
              <div className="flex justify-end mb-4">
                <button
                  onClick={toggleDrawer}
                  className="text-white hover:text-[#a95f30] p-1 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Profile Section */}
              <div className="flex flex-col items-center mb-6">
                <RouterLink
                  to="/profile"
                  onClick={() => setIsDrawerOpen(false)}
                  className="mb-3"
                >
                  <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white">
                    <ProfileIcon />
                  </div>
                </RouterLink>
                <span className="text-white text-lg font-bold">
                  {userName}
                </span>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1">
                <div className="space-y-2">
                  {[
                    { label: "Profile", path: "/profile" },
                    { label: "Search History", path: "/search-history" },
                    { label: "Saved Restaurants", path: "/saved-restaurants" },
                  ].map((item) => (
                    <RouterLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsDrawerOpen(false)}
                      className="block w-full text-left px-4 py-3 text-white hover:text-[#a95f30] hover:bg-white hover:bg-opacity-10 rounded-lg transition-all duration-200"
                    >
                      {item.label}
                    </RouterLink>
                  ))}
                  
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 text-white hover:text-[#a95f30] hover:bg-white hover:bg-opacity-10 rounded-lg transition-all duration-200"
                  >
                    Logout
                  </button>
                </div>
              </nav>
            </div>
          </div>
      )}
    </>
  );
};