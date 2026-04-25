import { NextRequest, NextResponse } from "next/server";
import { visionNode } from "@/lib/evaluation/visionNode"
import { getAnswerByQuestionId } from "@/lib/rag/retrieve";
import { graderNode } from "@/lib/evaluation/graderNode";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const images = formData.getAll("images") as File[];
  const examId = formData.get("examId") as string;
  const modelName = (formData.get("model") as string) || "gemini-1.5-flash";

  if (!images || images.length === 0 || !examId) {
    return NextResponse.json(
      { error: "images and examId required" },
      { status: 400 },
    );
  }

  try {
    const base64Images = await Promise.all(
      images.map(async (img) => {
        const bytes = await img.arrayBuffer();
        return Buffer.from(bytes).toString("base64");
      })
    );

    // Step 1 - vision
    const extracted = await visionNode(base64Images, modelName);

    // Step 2 - fetch correct answers
    const ragResults = await Promise.all(
      extracted.map(async (item) => ({
        questionId: item.questionId,
        studentAnswer: item.studentAnswer,
        questionText: item.questionText,
        correctAnswer: await getAnswerByQuestionId(
          examId,
          item.questionId.replace("Q", ""),
          item.studentAnswer,
          item.questionText
        ),
      })),
    );
    // Step 3 - grade
    const graded = await graderNode(ragResults, modelName);

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
  } catch (error: any) {
    console.error("Grading API Error:", error);
    
    // Parse Google GenAI specific errors to be more human-readable
    let errorMessage = "An unexpected error occurred during evaluation.";
    if (error.status === 404) {
      errorMessage = `The selected model (${modelName}) is not available or not supported by your API key.`;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
