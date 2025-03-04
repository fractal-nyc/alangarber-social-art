"use client";

import React, { useState, useEffect, useRef } from "react";

const ArtBuilder = () => {
  const [description, setDescription] = useState("");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  const generateGame = async () => {
    if (!description.trim() || isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/generate-game", {
        method: "POST",
        body: JSON.stringify({ prompt: description }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      console.log("Full API Response:", data); // ✅ Debugging

      if (!data || !data.code) {
        console.error("API did not return valid JavaScript:", data);
        setGeneratedCode(null);
        return;
      }

      // ✅ Use the JavaScript code directly, assuming it's valid
      setGeneratedCode(data.code.trim());
    } catch (error) {
      console.error("Error generating game:", error);
      setGeneratedCode(null);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (!generatedCode) return;

    // ✅ Clear previous game instance
    const gameContainer = document.getElementById("game-container");
    if (gameContainer) {
      gameContainer.innerHTML = ""; // Remove previous elements
    }

    // ✅ Remove old script if it exists
    if (scriptRef.current) {
      scriptRef.current.remove();
    }

    // ✅ Create a new script tag
    const script = document.createElement("script");
    script.textContent = generatedCode;
    scriptRef.current = script;
    document.body.appendChild(script); // ✅ Inject JavaScript into the DOM

    return () => {
      // ✅ Cleanup: Remove script when component unmounts
      if (scriptRef.current) {
        scriptRef.current.remove();
      }
    };
  }, [generatedCode]);

  return (
    <div className="flex flex-col items-center mt-10">
      <h1 className="text-2xl text-red-500 font-bold mb-4">
        AI Game Generator
      </h1>

      {/* Square container for the AI-generated game */}
      <div className="w-96 h-96 border border-gray-300 flex items-center justify-center relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div id="game-container" className="w-96 h-96"></div>
        )}
      </div>

      {/* Input field to describe the game */}
      <input
        type="text"
        placeholder="Describe a game (e.g., 'Flappy Bird')"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mt-4 px-4 py-2 border rounded w-80 text-black"
      />

      {/* Generate button */}
      <button
        onClick={generateGame}
        disabled={isLoading}
        className={`mt-4 px-4 py-2 rounded ${
          isLoading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500 text-white"
        }`}
      >
        {isLoading ? "Generating..." : "Generate Game"}
      </button>
    </div>
  );
};

export default ArtBuilder;
