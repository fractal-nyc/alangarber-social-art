"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface Artwork {
  id: string;
  title: string;
  imageUrl: string;
}

export default function FeedPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);

  useEffect(() => {
    fetch("/api/art")
      .then((res) => res.json())
      .then((data) => setArtworks(data));
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {artworks.map((art) => (
        <div key={art.id} className="border p-4">
          <h2 className="font-bold">{art.title}</h2>
          <Image src={art.imageUrl} alt={art.title} width={400} height={400} className="w-full" />
        </div>
      ))}
    </div>
  );
}
