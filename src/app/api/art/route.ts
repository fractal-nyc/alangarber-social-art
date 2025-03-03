import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const artworks = await prisma.art.findMany();
  return NextResponse.json(artworks);
}

export async function POST(req: Request) {
  const { title, imageUrl } = await req.json();
  const newArt = await prisma.art.create({
    data: { title, imageUrl, userId: "123" }, // Replace with actual user ID from session
  });
  return NextResponse.json(newArt);
}
