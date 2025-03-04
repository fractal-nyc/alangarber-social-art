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

    // Generate JavaScript code instead of a React component
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an AI that generates JavaScript code for simple interactive games. " +
            "The game must run inside an existing <div id='game-container'>. " +
            "The script should use plain JavaScript (no external libraries, no React). " +
            "The script should create and modify DOM elements dynamically inside 'game-container'. " +
            "Do NOT include import or export statements. " +
            "Return only the JavaScript code inside triple backticks (` ``` `), with NO explanations.",
        },
        {
          role: "user",
          content: `Generate a simple JavaScript game based on the following description: "${prompt}". 
          The game should be interactive and run inside <div id='game-container'>, modifying the DOM directly.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    console.log("aiResponse", aiResponse);

    // Extract raw JavaScript code from AI response
    const generatedCodeMatch = aiResponse.choices[0]?.message?.content?.match(
      /```(?:javascript)?\n([\s\S]*?)```/,
    );
    const generatedCode = generatedCodeMatch
      ? generatedCodeMatch[1].trim()
      : null;

    console.log("Extracted JavaScript Code:", generatedCode);

    if (!generatedCode) {
      return NextResponse.json(
        { error: "AI did not return valid JavaScript" },
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
