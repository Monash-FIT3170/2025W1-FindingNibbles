import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Custom Search Icon SVG
const SearchIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export const MainUI = () => {
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    // Navigate to login if not logged in, or to map if logged in
    navigate("/login");
  };

  return (
    <div 
      className="w-full min-h-screen pt-20 bg-cover bg-center flex items-center justify-center"
      style={{ 
        backgroundImage: "url('/images/food_background.png')",
        fontFamily: '"Comic Sans MS", cursive, sans-serif'
      }}
    >
      <div className="relative z-10 w-full max-w-xl mx-auto p-8 bg-white rounded-2xl shadow-xl text-center border-4 border-[#C47B4D] transform hover:scale-105 transition-transform duration-300">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#4b2e19]">
          What can we eat today...?
        </h2>
        
        <div className="relative mb-6">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter your location"
            className="w-full px-5 py-3 pr-12 text-lg border-2 border-[#e2cfc3] rounded-full focus:outline-none focus:ring-2 focus:ring-[#C47B4D] focus:border-[#C47B4D] transition-all duration-200 text-[#4b2e19]"
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#7a5c43]">
            <SearchIcon />
          </div>
        </div>
        
        <p className="block mb-4 text-[#C47B4D] text-lg font-medium">
          Simply click "search" to find restaurants!
        </p>
        
        <button
          onClick={handleSearch}
          className="px-8 py-3 text-white font-semibold rounded-full bg-[#C47B4D] hover:bg-[#A35F35] focus:outline-none focus:ring-2 focus:ring-[#C47B4D] focus:ring-offset-2 transform hover:scale-105 transition-all duration-200 shadow-lg"
        >
          Search
        </button>
        
        <div className="mt-6 text-sm text-[#7a5c43]">
          <p>🍴 Discover amazing restaurants near you</p>
          <p>🎯 Get personalized recommendations</p>
          <p>📍 Find your perfect dining spot</p>
        </div>
      </div>
    </div>
  );
};