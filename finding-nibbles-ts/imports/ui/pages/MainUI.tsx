import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from '@mui/icons-material/Search';

export const MainUI = () => {
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    // Optional: validate location before navigating
    navigate("/login");
  };

  return (
    <div className="w-full min-h-screen bg-gray-100">
      <div className="min-h-screen bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: "url('/images/food_background.png')" }}>
            
        <div
          className="relative z-10 w-full max-w-xl mx-auto p-8 bg-white rounded-2xl shadow-xl text-center"
          style={{ border: "4px solid #C3774E" }}
        >
          <h2 className="text-3xl md:text-4xl font-semibold mb-6 text-gray-800">
            What can we eat today...?
          </h2>
          <div className="relative mb-6">
          <input
            type="text"
            value="Your Location"
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter your location"
            className="w-full px-5 py-3 pr-12 text-lg border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <SearchIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>
        <span className="block mb-2 text-[#C3774E]">
          Simply click "search" to find restaurants!
        </span>
          <button
            onClick={handleSearch}
            className="mt-2 px-6 py-3 text-white font-semibold rounded-full transition"
            style={{ backgroundColor: "#C3774E" }}
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
};
