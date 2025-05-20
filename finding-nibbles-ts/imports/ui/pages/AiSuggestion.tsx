import React, { useState } from "react";

const AiSuggestion: React.FC = () => {
  const [suggestion, setSuggestion] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [selectedOccasion, setSelectedOccasion] = useState<string>("birthday");

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

  return (
    <div className="max-w-2xl mx-auto py-12 px-6 text-center">
      <h1 className="text-3xl font-bold mb-6">AI Dish Suggestions</h1>

      {loading ? (
        <div className="flex justify-center items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800" />
          <p className="text-lg">Generating dish...</p>
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : suggestion ? (
        <p className="text-xl text-gray-700 font-medium mb-6">{suggestion}</p>
      ) : null}

      <div className="space-y-4 mt-4">
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow transition"
          onClick={() => fetchSuggestion()}
          disabled={loading}
        >
          New Dish Recommendation
        </button>

        <div className="bg-white shadow p-4 rounded-lg">
          <label htmlFor="occasion" className="block text-left mb-2 font-semibold">Select Occasion:</label>
          <select
            id="occasion"
            className="w-full px-4 py-2 border rounded-md mb-2"
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
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg shadow transition"
            onClick={() => fetchSuggestion({ occasion: selectedOccasion })}
            disabled={loading}
          >
            Get Dish for Occasion
          </button>
        </div>

        <button
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg shadow transition"
          onClick={() => fetchSuggestion()} //associate with user preferences
          disabled={loading}
        >
          Suggest Dish from My Preference
        </button>
      </div>
    </div>
  );
};

export default AiSuggestion;
