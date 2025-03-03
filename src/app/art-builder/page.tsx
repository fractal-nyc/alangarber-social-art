"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function ArtBuilderPage() {
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSave = async () => {
    const res = await fetch("/api/art", {
      method: "POST",
      body: JSON.stringify({ title, imageUrl }),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) alert("Artwork saved!");
  };

  if (!user) return <p>Please log in</p>;

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold">Create Artwork</h1>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2"
      />
      <input
        type="text"
        placeholder="Image URL"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        className="border p-2"
      />
      <button onClick={handleSave} className="bg-green-500 p-2 text-white">
        Save
      </button>
    </div>
  );
}
