import { getAnswerByQuestionId } from "./retrieve";
import { ExtractedAnswer } from "./visionNode";

export interface RAGResult {
  questionId: string;
  studentAnswer: string;
  correctAnswer: string | null;
}

export async function ragNode(
  examId: string,
  extractedAnswers: ExtractedAnswer[],
): Promise<RAGResult[]> {
  const results = await Promise.all(
    extractedAnswers.map(async (item) => {
      const correctAnswer = await getAnswerByQuestionId(
        examId,
        item.questionId.replace("Q", ""), // strip Q prefix since retrieve adds it back
      );

      return {
        questionId: item.questionId,
        studentAnswer: item.studentAnswer,
        correctAnswer,
      };
    }),
  );

  console.log("RAG results:", results);
  return results;
}
