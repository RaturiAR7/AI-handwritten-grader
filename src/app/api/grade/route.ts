import { NextRequest, NextResponse } from "next/server";
import { visionNode } from "@/lib/rag/visionNode"
import { getAnswerByQuestionId } from "@/lib/rag/retrieve";
import { graderNode } from "@/lib/rag/graderNode";

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

  // Step 2 - fetch correct answers
  const ragResults = await Promise.all(
    extracted.map(async (item) => ({
      questionId: item.questionId,
      studentAnswer: item.studentAnswer,
      correctAnswer: await getAnswerByQuestionId(
        examId,
        item.questionId.replace("Q", ""),
      ),
    })),
  );

  // Step 3 - grade
  const graded = await graderNode(ragResults);

  // Step 4 - format final output
  const totalScore = graded.reduce((sum, item) => sum + item.score, 0);
  const maxScore = graded.length * 10;

  return NextResponse.json({
    examId,
    totalScore,
    maxScore,
    percentage: ((totalScore / maxScore) * 100).toFixed(1),
    results: graded,
  });
}
