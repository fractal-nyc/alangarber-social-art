"use client";

import "@/app/globals.css"; // ✅ Ensure Tailwind is loaded
import { ClerkProvider, useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <Navbar />
          <SyncUser /> {/* ✅ Ensure user exists in Prisma on login */}
          <main className="container mx-auto p-4">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}

// ✅ This component checks if the user exists in Prisma and syncs them
function SyncUser() {
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    if (isSignedIn && user) {
      fetch("/api/sync-user", {
        method: "POST",
        body: JSON.stringify({
          clerkUserId: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          name: user.firstName,
          imageUrl: user.imageUrl,
        }),
        headers: { "Content-Type": "application/json" },
      });
    }
  }, [isSignedIn, user]);

  return null; // This component does not render anything
}
