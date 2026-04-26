import { getAnswerByQuestionId } from "@/lib/rag/retrieve";
import { ExamGradingStateType } from "../states";

export async function retrievalNode(
  state: ExamGradingStateType,
): Promise<Partial<ExamGradingStateType>> {
  console.log(
    "[Agent] retrievalNode: fetching correct answers for",
    state.extractedAnswers.length,
    "question(s)",
  );

  try {
    const ragResults = await Promise.all(
      state.extractedAnswers.map(async (item) => ({
        questionId: item.questionId,
        studentAnswer: item.studentAnswer,
        questionText: item.questionText,
        correctAnswer: await getAnswerByQuestionId(
          state.examId,
          item.questionId.replace("Q", ""),
          item.studentAnswer,
          item.questionText,
        ),
      })),
    );

    console.log(
      "[Agent] retrievalNode: retrieved answers for",
      ragResults.length,
      "question(s)",
    );
    return { ragResults };
  } catch (error: any) {
    console.error("[Agent] retrievalNode failed:", error.message);
    return { error: `Answer retrieval failed: ${error.message}` };
  }
}
