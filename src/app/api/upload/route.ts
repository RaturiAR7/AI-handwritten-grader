export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPDF } from "@/lib/rag/pdf";
import { processAndStoreExam } from "@/lib/rag/pipeline";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const examId = formData.get("examId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    if (!examId) {
      return NextResponse.json(
        { error: "No examId provided" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const uint8Array = new Uint8Array(bytes);

    const extractedText = await extractTextFromPDF(uint8Array);

    await processAndStoreExam(examId, extractedText.text);

    return NextResponse.json({
      success: true,
      text: extractedText.text,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
