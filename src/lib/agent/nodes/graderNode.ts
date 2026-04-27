import { GoogleGenerativeAI } from "@google/generative-ai";
import { GRADER_PROMPT, GradeResult } from "@/constants/index";
import { ExamGradingStateType } from "../states";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function graderNode(
  state: ExamGradingStateType,
): Promise<Partial<ExamGradingStateType>> {
  console.log(
    "[Agent] graderNode: grading",
    state.ragResults.length,
    "answer(s)",
  );

  try {
    const model = genAI.getGenerativeModel({
      model: state.modelName,
      generationConfig: {
        //// 0.2 temperature allows the AI to craft feedback that sounds slightly more natural
        temperature: 0.2,
        maxOutputTokens: 1000,
      },
    });

    const context = state.ragResults
      .map(
        (item) => `
        Question ID: ${item.questionId}
        Question Text: ${item.questionText ?? "N/A"}
        Correct Answer (or Context from Text): ${item.correctAnswer ?? "N/A"}
        Student Answer: ${item.studentAnswer}
      `,
      )
      .join("\n---\n");

    const result = await model.generateContent(`${GRADER_PROMPT}${context}`);
    const text = result.response.text();
    /// AI models often wrap JSON in Markdown code blocks (e.g., ```json ... ```). This Regex strips those markers so the string can be parsed.
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const gradedResults: GradeResult[] = parsed.map((item: any) => {
      const original = state.ragResults.find(
        (r) => r.questionId === item.questionId,
      );
      return {
        questionId: item.questionId,
        studentAnswer: original?.studentAnswer ?? "",
        correctAnswer: original?.correctAnswer ?? "N/A",
        score: item.score,
        feedback: item.feedback,
      };
    });

    console.log("[Agent] graderNode: grading complete");
    return { gradedResults };
  } catch (error: any) {
    console.error("[Agent] graderNode failed:", error.message);
    return { error: `Grading failed: ${error.message}` };
  }
}
