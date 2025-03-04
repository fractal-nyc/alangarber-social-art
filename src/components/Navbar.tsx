"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white py-4">
      <div className="container mx-auto flex justify-between items-center px-4">
        {/* Left side: Navigation Links */}
        <div className="flex space-x-4">
          <Link href="/feed" className="hover:text-gray-300">
            Feed
          </Link>
          <Link href="/art-builder" className="hover:text-gray-300">
            Art Builder
          </Link>
        </div>

        {/* Right side: Auth Buttons */}
        <div className="flex space-x-4 items-center">
          {/* If signed out, show Log In button */}
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">
                Log In
              </button>
            </SignInButton>
          </SignedOut>

          {/* If signed in, show User Icon & Log Out button */}
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
            <SignOutButton>
              <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded">
                Log Out
              </button>
            </SignOutButton>
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}
