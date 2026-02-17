import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { readFile } from "fs/promises";
import path from "path";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { transcript, currentOutput, feedback, chatHistory } =
      await req.json();

    if (!transcript || !currentOutput || !feedback) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const messages: Anthropic.MessageParam[] = [
      {
        role: "user",
        content: `You previously generated the following content from a podcast transcript. The user wants you to revise it based on their feedback.

ORIGINAL TRANSCRIPT:
${transcript}

YOUR PREVIOUS OUTPUT:
${currentOutput}

Now the user has the following feedback/request:`,
      },
      {
        role: "assistant",
        content:
          "I understand. I have the original transcript and my previous output. What changes would you like me to make?",
      },
    ];

    // Add chat history for multi-turn conversation
    if (chatHistory && chatHistory.length > 0) {
      for (const msg of chatHistory) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // Add the latest feedback
    messages.push({
      role: "user",
      content: feedback,
    });

    // Read context.md
    const contextPath = path.join(process.cwd(), "context.md");
    const contextContent = await readFile(contextPath, "utf-8")
      .then((c) => c.replace(/<!--[\s\S]*?-->/g, "").trim())
      .catch(() => "");

    const systemPrompt = `You are helping refine content generated from a podcast transcript for The Gyaan Project (TGP). When the user asks for changes, apply them and return the FULL revised content (not just the changed parts). Keep the same format unless told otherwise. Be responsive to tone, style, and content feedback.

${contextContent ? `Here is important context about the podcast, host, audience, and style:\n\n${contextContent}` : ""}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      system: systemPrompt,
      messages,
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({ result: responseText });
  } catch (error: unknown) {
    console.error("Refine error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to refine content";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
