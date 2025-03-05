"use client";

import { useState } from "react";

export default function ArtBuilderPage() {
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [gameHTML, setGameHTML] = useState<string | null>(null);

  async function generateGame() {
    if (!description.trim() || isLoading) return;

    setIsLoading(true);
    setGameHTML(null); // Reset previous game

    try {
      const response = await fetch("/api/generate-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: description }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate game");
      }

      const html = await response.text();
      setGameHTML(html); // Store generated game HTML
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to generate game.");
    }

    setIsLoading(false);
  }

  function openGameInNewTab() {
    if (!gameHTML) return;

    const gameWindow = window.open("", "_blank");
    if (gameWindow) {
      gameWindow.document.write(gameHTML);
      gameWindow.document.close();
    } else {
      alert("Popup blocked! Please allow popups for this site.");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">Art Builder</h1>

      <input
        type="text"
        placeholder="Describe your game (e.g., 'Flappy Bird')"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mt-4 px-4 py-2 border rounded w-80 text-black"
      />

      {/* Generate Button */}
      {!gameHTML && (
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
      )}

      {/* Loading Spinner */}
      {isLoading && (
        <div className="mt-4 w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      )}

      {/* "Take Me to Game" Button (only appears when the game is ready) */}
      {gameHTML && !isLoading && (
        <button
          onClick={openGameInNewTab}
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
        >
          Take Me To Game
        </button>
      )}
    </div>
  );
}
