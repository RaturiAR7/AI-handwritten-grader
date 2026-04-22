import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPDF } from "@/lib/rag/pdf";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const uint8Array = new Uint8Array(bytes);

    const extractedText = await extractTextFromPDF(uint8Array);
    console.log(extractedText);

    return NextResponse.json({
      success: true,
      text: extractedText,
    });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
