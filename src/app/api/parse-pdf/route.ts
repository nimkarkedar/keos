import { NextRequest, NextResponse } from "next/server";
import { extractText } from "unpdf";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = new Uint8Array(await file.arrayBuffer());
    const { text } = await extractText(buffer);

    return NextResponse.json({ text });
  } catch (error: unknown) {
    console.error("PDF parse error:", error);
    return NextResponse.json(
      { error: "Failed to extract text from PDF" },
      { status: 500 }
    );
  }
}
