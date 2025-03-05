import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to query OpenAI and ensure we get a complete response
async function getCompleteGame(prompt: string): Promise<string> {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "You are an AI that generates JavaScript code for simple interactive games. " +
        "The game must run inside an existing <div id='game-container'>. " +
        "The script should use plain JavaScript (no external libraries, no React). " +
        "Do NOT include import or export statements. " +
        "Do NOT wrap the code inside `document.addEventListener('DOMContentLoaded', ...)` or `window.onload` handlers. " + // ✅ NEW RULE
        "The script should immediately execute, assuming 'game-container' already exists. " +
        "Return only the JavaScript code inside triple backticks (` ``` `), with NO explanations.",
    },
    {
      role: "user",
      content: `Generate a simple JavaScript game based on the following description: "${prompt}". 
        The game should be interactive and run inside <div id='game-container'>, modifying the DOM directly.`,
    },
  ];

  let completeCode = "";
  let retries = 5; // Maximum number of retries to complete the response
  let isComplete = false;

  while (retries > 0 && !isComplete) {
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages,
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

    if (!generatedCode && retries === 0) {
      console.log("AI Response:", aiResponse.choices[0]?.message?.content);
      throw new Error("AI did not return valid JavaScript.");
    }

    // Append this part to our complete code
    if (generatedCode) {
      completeCode += generatedCode;

      // Check if the response seems cut off
      if (generatedCode.endsWith("}") || generatedCode.endsWith(";")) {
        isComplete = true;
      } else {
        console.log("Detected incomplete response, requesting continuation...");
        messages.push({
          role: "assistant",
          content: `Here is the current JavaScript code:\n\`\`\`javascript\n${completeCode}\n\`\`\`\nIt seems to be incomplete. Please continue and finish the script.`,
        });
        retries--;
      }
    }
  }

  if (!isComplete) {
    throw new Error("Failed to get a complete script after multiple attempts.");
  }

  return completeCode;
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Invalid prompt" }, { status: 400 });
    }

    // Get a complete game script
    const completeGameScript = await getCompleteGame(prompt);

    return NextResponse.json({ code: completeGameScript });
  } catch (error) {
    console.error("OpenAI API error:", error);
    return NextResponse.json(
      { error: "Failed to generate game" },
      { status: 500 },
    );
  }
}
