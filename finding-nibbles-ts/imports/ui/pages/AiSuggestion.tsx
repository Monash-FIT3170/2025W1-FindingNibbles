import React, { useState, useEffect } from "react";
import { Meteor } from 'meteor/meteor';
import type { CustomUser } from "../types/User";

const AiSuggestion: React.FC = () => {
  const [suggestion, setSuggestion] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [selectedOccasion, setSelectedOccasion] = useState<string>("birthday");
  const [preferences, setPreferences] = useState<string[]>([]);

  function extractSuggestedDish(text: string): string | null {
      const match = text.match(/\*\*([^*]+)\*\*/);
      return match ? match[1] : null;
    }

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
    setImage("");
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

      const data: { suggestion?: string; dishes?: any[]; menu?: any } = await response.json();
      
      // Handle different response formats based on mode
      if (data.menu) {
        // Occasion mode response - display centerpiece and complements
        const { centerpiece, complements } = data.menu;
        let menuText = `**${centerpiece.name}** - ${centerpiece.description}`;
        if (complements && complements.length > 0) {
          menuText += "\n\nComplementary dishes:\n";
          complements.forEach((complement: any) => {
            menuText += `• **${complement.name}** - ${complement.description}\n`;
          });
        }
        setSuggestion(menuText);
      } else if (data.dishes && data.dishes.length > 0) {
        // Regular mode response - display first dish
        const firstDish = data.dishes[0];
        setSuggestion(`**${firstDish.name}** - ${firstDish.description}`);
      } else {
        setSuggestion(data.suggestion || "No suggestion received.");
      }

      // Extract dish name for image generation
      let dishName = "";
      if (data.menu) {
        dishName = data.menu.centerpiece.name;
      } else if (data.dishes && data.dishes.length > 0) {
        dishName = data.dishes[0].name;
      } else {
        dishName = extractSuggestedDish(data.suggestion ?? "") || "";
      }

      const imageRes = await fetch("/api/generateImage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: dishName }),
      });

      // if (!imageRes.ok) {
      //   throw new Error("Image generation failed");
      // }

      const imageData = await imageRes.json();
      
      // Use fallback image if imageUrl is present
      if (imageData.imageUrl) {
        setImage(imageData.imageUrl);
      } else {
        setImage(`data:image/png;base64,${imageData.image}`);
      }


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
    <div className="min-h-screen pt-20 bg-gradient-to-br from-orange-100 to-orange-200">
      <div className="max-w-6xl mx-auto pb-12 px-8 lg:px-20">
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
            {image && (
              <div className="mt-6 flex justify-center">
                <img
                  src={image}
                  alt="AI generated dish"
                  className="rounded-lg shadow-lg max-w-md border-4 border-yellow-300"
                />
              </div>
            )}

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
            onClick={() => fetchSuggestion({ occasion: selectedOccasion, mode: 'occasion' })}
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
    </div>
  );
};

export default AiSuggestion;