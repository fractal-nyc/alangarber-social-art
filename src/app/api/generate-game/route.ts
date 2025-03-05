import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    console.log("🚀 Game generation API started");

    // Parse the request body
    const body = await req.json();
    const prompt = body.prompt;

    if (!prompt) {
      console.log("❌ Missing prompt");
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    console.log(`📝 Received prompt: "${prompt}"`);

    // Create messages for OpenAI
    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are an expert game developer creating a JavaScript game. 
        STRICT REQUIREMENTS:
        - Generate COMPLETE, RUNNABLE code
        - Entire game must fit in one file
        - Use only vanilla JavaScript with HTML5 canvas
        - No external dependencies
        - Include canvas setup and initialization
        - Make the canvas 800x600 pixels
        - Include comments explaining the code
        - Console log the controls for the game
        
        FORMAT YOUR RESPONSE EXACTLY LIKE THIS:
        \`\`\`javascript
        // Your complete game code here
        \`\`\``,
      },
      {
        role: "user",
        content: `Please generate a game based on this description: "${prompt}". 
        Make sure it is complete and ready to run.`,
      },
    ];

    // Create a stream from OpenAI
    console.log("⏳ Creating OpenAI stream...");
    const stream = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages,
      stream: true,
      temperature: 0.6,
      max_tokens: 1500,
      top_p: 0.9,
      frequency_penalty: 0.2,
      presence_penalty: 0.2,
    });

    // Create a readable stream to pipe the response
    const textEncoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        console.log("🌊 Stream started");

        try {
          let totalContent = "";
          let chunkCount = 0;

          for await (const chunk of stream) {
            // Get the content from the chunk
            const content = chunk.choices[0]?.delta?.content || "";

            if (content) {
              totalContent += content;
              chunkCount++;

              // Send the raw content directly to the client
              controller.enqueue(textEncoder.encode(content));

              if (chunkCount % 50 === 0) {
                console.log(
                  `🔄 Processed ${chunkCount} chunks, current length: ${totalContent.length}`,
                );
              }
            }
          }

          console.log(
            `✅ Stream completed with ${chunkCount} chunks, total length: ${totalContent.length}`,
          );
          controller.close();
        } catch (error) {
          console.error("❌ Stream error:", error);
          controller.error(error);
        }
      },
    });

    // Return the raw stream without any SSE formatting
    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("❌ API error:", error);
    return NextResponse.json({ error: "Stream failed" }, { status: 500 });
  }
}
