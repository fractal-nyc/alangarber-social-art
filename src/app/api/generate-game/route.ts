import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Load from environment variables
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Invalid prompt" }, { status: 400 });
    }

    // Generate React component using OpenAI
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an AI that generates minimal, functional React game components using only basic React features (no external libraries). The game must work within a 400x400px div.",
        },
        {
          role: "user",
          content: `Generate a simple functional React component for a game that has been described as follows: "${prompt}". The component should be self-contained and must return a <div className="game">...</div>.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    console.log(aiResponse);

    const generatedCode = aiResponse.choices[0]?.message?.content?.trim();
    console.log(generatedCode);

    if (!generatedCode) {
      return NextResponse.json(
        { error: "AI did not return valid code" },
        { status: 500 },
      );
    }

    return NextResponse.json({ code: generatedCode });
  } catch (error) {
    console.error("OpenAI API error:", error);
    return NextResponse.json(
      { error: "Failed to generate game" },
      { status: 500 },
    );
  }
}
