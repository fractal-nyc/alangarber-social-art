import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Wrapper to generate game with very specific constraints
async function generateConstrainedGame(prompt: string): Promise<string> {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `You are an expert game developer creating a JavaScript game. 
      STRICT REQUIREMENTS:
      - Generate COMPLETE, RUNNABLE code
      - Entire game must fit in one file
      - Use only vanilla JavaScript with HTML5 canvas
      - No external dependencies
      - Code must be between game template markers
      
      Game Template Instructions:
      Create a simple HTML5 canvas game with these requirements:
1. Use HTML5 canvas for rendering
2. Include basic game mechanics
3. Respond with complete, runnable code
4. No external libraries
5. Include comments explaining the code
6. Console log the controls for the game.
      
      FORMAT YOUR RESPONSE EXACTLY LIKE THIS:
      \`\`\`javascript
      // Your complete game code here
      \`\`\``,
    },
    {
      role: "user",
      content: `Please generate a game based on this description: "${prompt}". 
      Follow ALL provided template guidelines strictly.`,
    },
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages,
      temperature: 0.6, // Slightly lower for more consistent output
      max_tokens: 1500, // Increased token limit
      top_p: 0.9,
      frequency_penalty: 0.2,
      presence_penalty: 0.2,
    });

    const content = response.choices[0]?.message?.content || "";

    // Extract code between triple backticks
    const codeMatch = content.match(/```javascript([\s\S]*?)```/);
    if (!codeMatch) {
      throw new Error("No valid game code found");
    }

    const gameCode = codeMatch[1].trim();

    // Wrap game in a complete HTML template
    const gameHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Generated Game</title>
    <style>
        body { 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            margin: 0; 
            background: #f0f0f0; 
        }
        canvas { 
            border: 2px solid #333; 
            background: white; 
        }
    </style>
</head>
<body>
    <script>
        ${gameCode}
    </script>
</body>
</html>
    `.trim();

    return gameHTML;
  } catch (error) {
    console.error("Game generation error:", error);
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Invalid prompt" }, { status: 400 });
    }

    const gameHTML = await generateConstrainedGame(prompt);

    return new Response(gameHTML, {
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Game generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate game" },
      { status: 500 },
    );
  }
}
