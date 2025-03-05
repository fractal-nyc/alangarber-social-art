import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware(); // Keep basic Clerk functionality

export const config = {
  matcher: ["/((?!_next).*)"], // Apply middleware to all routes except Next.js internals
};
