import React, { useState, useEffect } from "react";

const AiSuggestion: React.FC = () => {
  const [suggestion, setSuggestion] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchSuggestion = async (cuisineType: string | null = null): Promise<void> => {
    setLoading(true);
    setSuggestion("");
    setError("");

    try {
      const response = await fetch("/api/aiSuggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuisineType ? { cuisine: cuisineType } : {})
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
    fetchSuggestion();
  }, []);

  return (
    <div className="max-w-xl mx-auto py-12 px-6 text-center">
      <h1 className="text-3xl font-bold mb-6">AI Dish Suggestion</h1>

      {loading ? (
        <div className="flex justify-center items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800" />
          <p className="text-lg">Generating dish...</p>
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <p className="text-xl text-gray-700 font-medium">{suggestion}</p>
      )}

      <button
        className="mt-8 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow transition"
        onClick={() => fetchSuggestion()}
        disabled={loading}
      >
        Generate Another Dish
      </button>
    </div>
  );
};

export default AiSuggestion;
