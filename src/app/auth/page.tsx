"use client";

import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

export default function AuthPage() {
  const { isSignedIn } = useUser();

  if (isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold">Welcome!</h1>
        <UserButton />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Login or Sign Up</h1>
      <SignInButton mode="modal" />
      <SignUpButton mode="modal" />
    </div>
  );
}