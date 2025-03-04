"use client";

import React, { useState } from "react";

const ArtBuilder = () => {
  const [description, setDescription] = useState("");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const generateGame = async () => {
    if (!description.trim()) return;

    const response = await fetch("/api/generate-game", {
      method: "POST",
      body: JSON.stringify({ prompt: description }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();
    setGeneratedCode(data.code);
  };

  return (
    <div className="flex flex-col items-center mt-10">
      <h1 className="text-2xl text-red-500 font-bold mb-4">AI Game Generator</h1>

      {/* Square container for the AI-generated game */}
      <div className="w-96 h-96 border border-gray-300 flex items-center justify-center">
        {generatedCode ? (
          <DynamicGame code={generatedCode} />
        ) : (
          <p className="text-gray-400">Generated game will appear here</p>
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
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Generate Game
      </button>
    </div>
  );
};

// Component that dynamically renders AI-generated code
const DynamicGame = ({ code }: { code: string }) => {
  try {
    const Component = eval(`(() => { ${code}; return Game; })()`);
    return <Component />;
  } catch (error) {
    return <p className="text-red-500">Error loading game: {String(error)}</p>;
  }
};

export default ArtBuilder;
