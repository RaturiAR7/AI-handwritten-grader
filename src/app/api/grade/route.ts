import { NextRequest, NextResponse } from "next/server";
import { examGradingAgent } from "@/lib/agent/graph";

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
    // Convert images to base64
    const imagesBase64 = await Promise.all(
      images.map(async (img) => {
        const bytes = await img.arrayBuffer();
        return Buffer.from(bytes).toString("base64");
      }),
    );

    // Run the agentic graph
    const finalState = await examGradingAgent.invoke({
      examId,
      imagesBase64,
      modelName,
    });

    // Surface any agent-level error
    if (finalState.error) {
      return NextResponse.json({ error: finalState.error }, { status: 500 });
    }

    const graded = finalState.gradedResults;
    const totalScore = graded.reduce(
      (sum: number, item: any) => sum + item.score,
      0,
    );
    const maxScore = graded.length * 10;

    return NextResponse.json({
      examId,
      totalScore,
      maxScore,
      percentage: ((totalScore / maxScore) * 100).toFixed(1),
      results: graded,
    });
  } catch (error: any) {
    console.error("Grading Agent Error:", error);

    let errorMessage = "An unexpected error occurred during evaluation.";
    if (error.status === 404) {
      errorMessage = `The selected model (${modelName}) is not available or not supported by your API key.`;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
