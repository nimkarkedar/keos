import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { readFile } from "fs/promises";
import path from "path";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

    const contextPath = path.join(process.cwd(), "context.md");
    const contextContent = await readFile(contextPath, "utf-8")
      .then((c) => c.replace(/<!--[\s\S]*?-->/g, "").trim())
      .catch(() => "");

    const mdPath = path.join(process.cwd(), fileName);
    const promptContent = await readFile(mdPath, "utf-8");
    const instructions = promptContent.replace(/<!--[\s\S]*?-->/g, "").trim();

    const systemPrompt = `You are a content repurposing expert working for The Gyaan Project (TGP). Follow the user's instructions precisely. Stick to the transcript — do not fabricate information, quotes, or details that are not in the transcript. Output only what is asked for.

${contextContent ? `Here is important context about the podcast, host, audience, and style:\n\n${contextContent}` : ""}`;

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 4096,
      messages: [
        { role: "system", content: systemPrompt },
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

    const responseText = response.choices[0]?.message?.content ?? "";

    const lines = responseText.split("\n");
    const guestName = lines[0].trim();
    const content = lines.slice(1).join("\n").trim();

    return NextResponse.json({ guestName, result: content });
  } catch (error: unknown) {
    console.error("OpenAI generation error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate content";
    const isRateLimit =
      errorMessage.includes("rate_limit") || errorMessage.includes("429");
    return NextResponse.json(
      { error: isRateLimit ? "rate_limit" : errorMessage },
      { status: isRateLimit ? 429 : 500 }
    );
  }
}
