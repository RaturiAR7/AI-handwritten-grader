import { NextRequest, NextResponse } from "next/server";
import { visionNode } from "@/lib/rag/visionNode";
import { ragNode } from "@/lib/rag/ragNode";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const image = formData.get("image") as File;
  const examId = formData.get("examId") as string;

  if (!image || !examId) {
    return NextResponse.json(
      { error: "image and examId required" },
      { status: 400 },
    );
  }

  const bytes = await image.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");

  // Step 1 - vision
  const extracted = await visionNode(base64);
  console.log("Extracted:", extracted);

  // Step 2 - rag
  const ragResults = await ragNode(examId, extracted);
  console.log("RAG Results:", ragResults);

  return NextResponse.json({ extracted, ragResults });
}
