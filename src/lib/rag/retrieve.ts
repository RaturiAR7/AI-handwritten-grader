import { getVectorStore } from "./pipeline";

export async function getAnswerByQuestionId(
  examId: string,
  questionId: string,
  studentAnswer: string = "",
  questionText: string = "",
) {
  try {
    const vectorStore = getVectorStore(examId);

    if (!vectorStore) {
      throw new Error(`No vector store found for examId: ${examId}`);
    }

    // 1. Try exact metadata match first
    const allDocs = await vectorStore.similaritySearch("test", 100);
    const exact = allDocs.find(
      (d) => d.metadata.questionId === `Q${questionId}`,
    );
    if (exact) return exact.pageContent;

    // 2. Fallback to semantic search
    console.log("Used semantic fallback");
    const searchQuery = questionText.trim() || studentAnswer.trim();
    console.log("Search query:", searchQuery);

    if (searchQuery) {
      const results = await vectorStore.similaritySearch(searchQuery, 2);
      return results.map((d) => d.pageContent).join("\n");
    }
  } catch (error) {
    console.error("Error retrieving answer:", error);
  }

  return null;
}
