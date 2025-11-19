import React, { useState, useMemo } from 'react';
import { X, Loader2, Sparkles, MapPin, Navigation } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// This is the same Gemini API call helper from before
async function fetchGeminiAnalysis(startPoint, currentPoint) {
  // *** FIX: Read the key securely from the environment ***
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!API_KEY) {
    console.error("Gemini API Key is missing. Please add it to your .env file.");
    return "Error: Gemini API key is not configured. See console for details.";
  }

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`;

  const prompt = `
You are a senior meteorologist and geographer. Analyze the following 24-hour weather balloon journey and provide an insightful summary.

Data:
- Start Point (24h ago): Latitude=${startPoint[0].toFixed(4)}, Longitude=${startPoint[1].toFixed(4)}, Altitude=${startPoint[2].toFixed(2)} km
- Current Point: Latitude=${currentPoint[0].toFixed(4)}, Longitude=${currentPoint[1].toFixed(4)}, Altitude=${currentPoint[2].toFixed(2)} km

Instructions:
Provide your analysis in three short paragraphs:
1.  **Start Location:** Briefly describe the geographical location (e.g., "over the North Atlantic," "above the Sahara Desert").
2.  **Current Location:** Briefly describe the current geographical location.
3.  **Journey Insight:** Provide a brief meteorological insight. What does this journey imply? (e.g., "This path suggests it was captured by a powerful subtropical jet stream," "The significant change in altitude indicates...").
`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
    ],
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
    const result = await response.json();
    
    // *** FIX: Added check for candidates and content parts ***
    if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts) {
      return result.candidates[0].content.parts[0].text;
    } else {
      // Handle cases where the response is blocked or empty
      return "Analysis could not be generated for this location. (Response may be blocked or empty)";
    }
  } catch (error) {
    console.error("Failed to fetch Gemini data:", error);
    return "An error occurred while analyzing the journey. Please try again.";
  }
}

// Helper to render a coordinate
const CoordCard = ({ title, point, icon }) => (
  <div className="bg-gray-700/50 p-4 rounded-lg">
    <div className="flex items-center text-gray-300 mb-2">
      {icon}
      <h3 className="ml-2 font-bold text-lg">{title}</h3>
    </div>
    <ul className="text-gray-100 space-y-1">
      <li><strong>Lat:</strong> {point[0].toFixed(4)}</li>
      <li><strong>Lon:</strong> {point[1].toFixed(4)}</li>
      <li><strong>Alt:</strong> {point[2].toFixed(2)} km</li>
    </ul>
  </div>
);

export default function AnalysisModal({ balloon, onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  // *** FIX: Corrected typo 'useState(null); =' -> 'useState' ***
  const [analysis, setAnalysis] = useState(null);

  // Find the "start point" - it's the last point in the history array
  const startPoint = useMemo(() => {
    return balloon.history.length > 0 ? balloon.history[balloon.history.length - 1] : balloon.current;
  }, [balloon]);

  const currentPoint = balloon.current;

  const handleAnalyze = async () => {
    setIsLoading(true);
    setAnalysis(null);
    const result = await fetchGeminiAnalysis(startPoint, currentPoint);
    setAnalysis(result);
    setIsLoading(false);
  };

  return (
    <div 
      className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl text-white border border-gray-600 overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold">Journey Analysis: Balloon ID {balloon.id}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700"
          >
            <X size={24} />
          </button>
        </header>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* --- Data Section --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <CoordCard title="Start Point (24h Ago)" point={startPoint} icon={<MapPin size={20} />} />
            <CoordCard title="Current Point" point={currentPoint} icon={<Navigation size={20} />} />
          </div>

          {/* --- Button Section --- */}
          {!analysis && !isLoading && (
            <button
              onClick={handleAnalyze}
              className="w-full flex items-center justify-center p-3 rounded-lg bg-blue-600 hover:bg-blue-500 font-bold text-lg transition-colors"
            >
              <Sparkles size={20} className="mr-2" />
              Analyze with Gemini
            </button>
          )}

          {/* --- Loading & Result Section --- */}
          {isLoading && (
            <div className="flex items-center justify-center p-6 bg-gray-700/50 rounded-lg">
              <Loader2 size={24} className="animate-spin mr-3" />
              <span className="text-lg">Analyzing journey...</span>
            </div>
          )}

          {analysis && (
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-bold mb-4 text-blue-300 flex items-center">
                <Sparkles size={20} className="mr-2" />
                Gemini Analysis
              </h3>
              <div className="prose prose-invert prose-sm max-w-none 
                prose-headings:text-blue-200 prose-headings:font-bold prose-headings:mb-3 prose-headings:mt-4
                prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
                prose-strong:text-white prose-strong:font-semibold
                prose-li:text-gray-300 prose-li:mb-2
                prose-ul:my-3 prose-ol:my-3">
                <ReactMarkdown>{analysis}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}