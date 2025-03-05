"use client";

import { useState, useEffect } from "react";

export default function ArtBuilderPage() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [content, setContent] = useState("");
  const [gameHTML, setGameHTML] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle form submission with streaming
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      setError("Please enter a game description");
      return;
    }

    setError(null);
    setContent("");
    setGameHTML(null);
    setIsGenerating(true);

    try {
      // Make a fetch request to our streaming endpoint
      const response = await fetch("/api/generate-game", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get a reader from the response body
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Failed to get stream reader");
      }

      const decoder = new TextDecoder();

      // Read the stream
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        // Decode the chunk and append it to our content
        const chunk = decoder.decode(value, { stream: true });
        setContent((prev) => prev + chunk);
      }
    } catch (err) {
      console.error("Error during streaming:", err);
      setError(
        `Error: ${err instanceof Error ? err.message : "An unknown error occurred"}`,
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Process content to extract code and create game HTML
  useEffect(() => {
    if (!content) return;

    try {
      // Extract code from markdown code blocks
      const codeMatch = content.match(/```(?:javascript|js)?([\s\S]*?)```/) || [
        null,
        content,
      ];
      let codeContent = codeMatch[1]?.trim();

      if (codeContent) {
        // Check if the code contains HTML body tags
        const bodyTagCount = (codeContent.match(/<body/g) || []).length;

        if (bodyTagCount > 1) {
          // Multiple body tags - something's wrong
          setError(
            "Multiple <body> tags detected in the generated code - try again",
          );
          return;
        } else if (bodyTagCount === 1) {
          // Extract just the content between body tags
          const bodyContentMatch = codeContent.match(
            /<body[^>]*>([\s\S]*?)<\/body>/,
          );

          if (bodyContentMatch && bodyContentMatch[1]) {
            // Log what we found
            console.log("Found body content, extracting...");

            // Extract content between tags, but check if it contains script tags
            const bodyContent = bodyContentMatch[1].trim();

            // If there's a script tag in the body content, extract just the script content
            const scriptMatch = bodyContent.match(
              /<script[^>]*>([\s\S]*?)<\/script>/,
            );
            if (scriptMatch && scriptMatch[1]) {
              codeContent = scriptMatch[1].trim();
              console.log("Extracted script content from body");
            } else {
              // No script tags, just use the body content
              codeContent = bodyContent;
              console.log("Using body content (no script tags found)");
            }
          }
        }

        // Check for canvas element and add it if missing
        const hasCanvasElement =
          codeContent.includes("<canvas") ||
          codeContent.includes('document.createElement("canvas")') ||
          codeContent.includes("document.createElement('canvas')");

        // Create HTML with the game code
        const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <title>Generated Game</title>
      <style>
          body { 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              height: 100vh; 
              margin: 0; 
              background: #f0f0f0; 
          }
          canvas { 
              border: 2px solid #333; 
              background: white; 
          }
      </style>
  </head>
  <body>
      ${!hasCanvasElement ? '<canvas id="gameCanvas" width="800" height="600"></canvas>' : ""}
      <script>${codeContent}</script>
  </body>
  </html>
        `;

        setGameHTML(html);
      }
    } catch (err) {
      console.error("Error processing code:", err);
      setError(
        `Error processing code: ${err instanceof Error ? err.message : "An unknown error occurred"}`,
      );
    }
  }, [content]);

  // Function to open the game in a new tab
  const openGameInNewTab = () => {
    if (!gameHTML) return;

    const gameWindow = window.open("", "_blank");
    if (gameWindow) {
      gameWindow.document.write(gameHTML);
      gameWindow.document.close();
    } else {
      setError("Popup blocked! Please allow popups for this site.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold">Art Builder</h1>
      <p className="mt-2 text-gray-600">
        Generate custom HTML5 canvas games with AI
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-md mt-8">
        <div className="flex flex-col space-y-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your game (e.g., 'Flappy Bird')"
            className="px-4 py-2 border rounded text-black"
            disabled={isGenerating}
          />

          <button
            type="submit"
            disabled={isGenerating}
            className={`px-4 py-2 rounded ${
              isGenerating
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {isGenerating ? "Generating..." : "Generate Game"}
          </button>
        </div>
      </form>

      {/* Generated Code Display */}
      {(content || isGenerating) && (
        <div className="w-full max-w-2xl mt-8 border rounded p-4 bg-gray-100 relative">
          <h2 className="text-lg font-semibold mb-2">Generated Code:</h2>
          {isGenerating && (
            <div className="absolute top-2 right-2">
              <div className="animate-pulse text-blue-500">Streaming...</div>
            </div>
          )}
          <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-96 text-black">
            {content || "Code will appear here..."}
          </pre>
        </div>
      )}

      {/* Game Controls */}
      {gameHTML && !isGenerating && (
        <div className="mt-8 text-center">
          <p className="text-green-600 mb-4">Game generated successfully!</p>
          <button
            onClick={openGameInNewTab}
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Play Game in New Tab
          </button>
        </div>
      )}

      {error && (
        <div className="mt-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {isGenerating && (
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Generating your game... This may take up to a minute.
          </p>
          <div className="mt-4 w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
