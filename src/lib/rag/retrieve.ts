import { ChromaClient } from "chromadb";
import { embedder } from "./embed";

export async function getAnswerByQuestionId(
  examId: string,
  questionId: string,
  studentAnswer: string = "",
  questionText: string = "",
) {
  try {
    const client = new ChromaClient({
      host: process.env.CHROMA_DB_URL || "localhost",
      port: 443, /// Use 8000 for localhost
      ssl: true,
    });
    const collection = await client.getCollection({ name: examId });

    // 1. Try exact metadata match first
    const result = await collection.get({
      where: { questionId: `Q${questionId}` },
    });

    if (result.documents?.length > 0 && result.documents[0]) {
      console.log("Exact match found for:", questionId);
      return result.documents[0];
    }

    // 2. Fallback to semantic search
    console.log("Used semantic fallback for:", questionId);
    const searchQuery = questionText.trim() || studentAnswer.trim();

    if (searchQuery) {
      const queryEmbedding = await embedder.embedQuery(searchQuery);
      const searchResult = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: 2,
      });
      return searchResult.documents?.[0]?.join("\n") || null;
    }
  } catch (error) {
    console.error("Error retrieving answer:", error);
  }

  return null;
}
