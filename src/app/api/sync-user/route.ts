import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { clerkUserId, email, name, imageUrl } = await req.json();

    await prisma.user.upsert({
      where: { clerkUserId },
      update: { email, name, imageUrl },
      create: { clerkUserId, email, name, imageUrl },
    });

    return NextResponse.json({ message: "User synced successfully" });
  } catch (error) {
    console.error("❌ Error syncing user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
