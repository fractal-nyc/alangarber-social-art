"use client";

import { useState } from "react";

export default function BasicStreaming() {
  const [prompt, setPrompt] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  // Start the stream
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setError("");
    setContent("");
    setStreaming(true);

    try {
      // Make a fetch request to our basic streaming endpoint
      const response = await fetch("/api/basic-stream", {
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
      const decoder = new TextDecoder();

      // Read the stream
      while (true) {
        const { done, value } = await (
          reader as ReadableStreamDefaultReader<Uint8Array<ArrayBufferLike>>
        ).read();

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
      setStreaming(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Basic Streaming Demo</h1>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor="prompt">Enter game description:</label>
          <input
            id="prompt"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="border p-2 rounded text-black"
            placeholder="e.g., Flappy Bird"
            disabled={streaming}
          />

          <button
            type="submit"
            disabled={streaming}
            className={`p-2 rounded ${
              streaming ? "bg-gray-400" : "bg-blue-500 text-white"
            }`}
          >
            {streaming ? "Generating..." : "Generate"}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-2 rounded mb-4">
          {error}
        </div>
      )}

      <div className="border rounded p-4 bg-gray-50 min-h-64 relative">
        <h2 className="text-lg font-semibold mb-2">Streamed Content:</h2>
        {streaming && (
          <div className="absolute top-2 right-2">
            <div className="animate-pulse text-blue-500">Streaming...</div>
          </div>
        )}
        <pre className="whitespace-pre-wrap text-sm">
          {content || "Content will appear here..."}
        </pre>
      </div>
    </div>
  );
}
