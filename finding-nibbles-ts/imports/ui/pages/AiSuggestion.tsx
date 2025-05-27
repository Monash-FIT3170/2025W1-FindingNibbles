import React, { useState, useEffect } from "react";
import { Meteor } from 'meteor/meteor';
import type { CustomUser } from "../types/User";

const AiSuggestion: React.FC = () => {
  const [suggestion, setSuggestion] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [selectedOccasion, setSelectedOccasion] = useState<string>("birthday");
  const [preferences, setPreferences] = useState<string[]>([]);

  function formatBold(text: string) {
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        part
      )
    );
  }
  const fetchSuggestion = async (params: Record<string, string> = {}): Promise<void> => {
    setLoading(true);
    setSuggestion("");
    setError("");

    try {
      const response = await fetch("/api/aiSuggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data: { suggestion?: string } = await response.json();
      setSuggestion(data.suggestion || "No suggestion received.");
    } catch (err) {
      console.error("Failed to fetch suggestion:", err);
      setError("Failed to get a suggestion. Please try again.");
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
      const user = Meteor.user() as CustomUser | null;
      if (user?.profile?.preferences) {
        setPreferences(user.profile.preferences);
      }
    }, []);


  return (
    <div className="max-w-6xl mx-auto py-12 px-8 lg:px-20 bg-gradient-to-br from-orange-100 to-orange-200 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 drop-shadow-md">
        AI Dish Suggestions
      </h1>

      {/* Loading, Error, or Suggestion Display */}
      <div className="mb-8">
        {loading ? (
          <div className="flex justify-center items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800" />
            <p className="text-lg text-gray-700">Generating dish...</p>
          </div>
        ) : error ? (
          <p className="text-red-500 text-center text-lg">{error}</p>
        ) : suggestion ? (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-6 rounded-lg shadow-md animate-fade-in">
            <p className="text-2xl text-gray-800 font-medium text-center">
              <span className="font-bold text-yellow-700">Recommended Dish:</span>
              {formatBold(suggestion)}
            </p>
          </div>
        ) : null}
      </div>

      {/* Buttons and Inputs */}
      <div className="space-y-8">
        {/* New Dish Recommendation Button */}
        <button
          className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 flex items-center justify-center"
          onClick={() => fetchSuggestion()}
          disabled={loading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          New Dish Recommendation
        </button>

        {/* Occasion Selector */}
        <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow">
          <label
            htmlFor="occasion"
            className="block text-left mb-3 font-semibold text-gray-700"
          >
            Select Occasion:
          </label>
          <select
            id="occasion"
            className="w-full px-4 py-3 border border-gray-300 rounded-md mb-4 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            value={selectedOccasion}
            onChange={(e) => setSelectedOccasion(e.target.value)}
            disabled={loading}
          >
            <option value="birthday">Birthday</option>
            <option value="date night">Date Night</option>
            <option value="holiday">Holiday</option>
            <option value="family dinner">Family Dinner</option>
            <option value="celebration">Celebration</option>
          </select>

          <button
            className="w-full bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
            onClick={() => fetchSuggestion({ occasion: selectedOccasion })}
            disabled={loading}
          >
            Get Dish for Occasion
          </button>
        </div>

        {/* Suggest Dish from Preferences */}
        <button
          className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
          onClick={() => fetchSuggestion({ preferences: preferences.join(',') })} // Associate with user preferences
          disabled={loading}
        >
          Can't decide what to eat? 
        </button>
      </div>
    </div>
  );
};

export default AiSuggestion;