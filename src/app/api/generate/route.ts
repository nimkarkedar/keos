import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { readFile } from "fs/promises";
import path from "path";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const FORMAT_TO_FILE: Record<string, string> = {
  learnings: "Learnings.md",
  qa: "Q&A.md",
  "making-post": "Making-post.md",
  "making-yt": "makingYT.md",
};

export async function POST(req: NextRequest) {
  try {
    const { transcript, format } = await req.json();

    if (!transcript || !format) {
      return NextResponse.json(
        { error: "Missing transcript or format" },
        { status: 400 }
      );
    }

    const fileName = FORMAT_TO_FILE[format];
    if (!fileName) {
      return NextResponse.json(
        { error: "Invalid format selected" },
        { status: 400 }
      );
    }

    // Read context.md for system-level context
    const contextPath = path.join(process.cwd(), "context.md");
    const contextContent = await readFile(contextPath, "utf-8")
      .then((c) => c.replace(/<!--.*?-->/gs, "").trim())
      .catch(() => "");

    // Read the prompt from the corresponding .md file — preserve it fully
    const mdPath = path.join(process.cwd(), fileName);
    const promptContent = await readFile(mdPath, "utf-8");

    // Only strip HTML comments, keep everything else intact
    const instructions = promptContent.replace(/<!--.*?-->/gs, "").trim();

    const systemPrompt = `You are a content repurposing expert working for The Gyaan Project (TGP). Follow the user's instructions precisely. Stick to the transcript — do not fabricate information, quotes, or details that are not in the transcript. Output only what is asked for.

${contextContent ? `Here is important context about the podcast, host, audience, and style:\n\n${contextContent}` : ""}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Here are my instructions for generating the output:

${instructions}

ADDITIONAL INSTRUCTION: Your response MUST start with the very first line being ONLY the guest's full name (extracted from the transcript). Then leave a blank line, and then provide the rest of the output as instructed above.

Here is the transcript:

${transcript}`,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Extract guest name from the first line
    const lines = responseText.split("\n");
    const guestName = lines[0].trim();
    const content = lines.slice(1).join("\n").trim();

    return NextResponse.json({ guestName, result: content });
  } catch (error: unknown) {
    console.error("Generation error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate content";
    const isRateLimit = errorMessage.includes("rate_limit") || errorMessage.includes("429");
    return NextResponse.json(
      { error: isRateLimit ? "rate_limit" : errorMessage },
      { status: isRateLimit ? 429 : 500 }
    );
  }
}
