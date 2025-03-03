import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware((auth, req) => {
  return NextResponse.next();
});

// Ensure Next.js knows this is middleware
export const config = {
  matcher: ["/((?!_next).*)"], // Apply to all pages except Next.js internals
}; 