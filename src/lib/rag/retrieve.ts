import { chromaClient } from "./chroma";

export async function getAnswerByQuestionId(
  examId: string,
  questionId: string,
) {
  try {
    const collection = await chromaClient.getOrCreateCollection({
      name: examId,
    });

    const result = await collection.get({
      ids: [`${examId}-Q${questionId}`],
    });
    return result.documents?.[0] || null;
  } catch (error) {
    console.error("Error retrieving answer:", error);
    throw error;
  }
}
