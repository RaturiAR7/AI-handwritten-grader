import { ChromaClient } from "chromadb";
import { embeddings } from "./embed";

export async function getAnswerByQuestionId(
  examId: string,
  questionId: string,
  studentAnswer: string = "",
  questionText: string = ""
) {
  const client = new ChromaClient({ host: "localhost", port: 8000 });
  
  try {
    const col = await client.getCollection({ name: examId });

    // 1. Try exact metadata match first
    const result = await col.get({
      where: { questionId: `Q${questionId}` }, // filter by metadata
    });

    if (result.documents && result.documents.length > 0 && result.documents[0]) {
      return result.documents[0];
    }

    // 2. Fallback to semantic search if exact match fails
    const searchQuery = questionText.trim() || studentAnswer.trim();
    if (searchQuery) {
      const queryEmbedding = await embeddings.embedQuery(searchQuery);
      const searchResult = await col.query({
        queryEmbeddings: [queryEmbedding],
        nResults: 2,
      });

      if (searchResult.documents && searchResult.documents.length > 0 && searchResult.documents[0].length > 0) {
        // Return top matches joined together as context
        return searchResult.documents[0].join("\n");
      }
    }
  } catch (error) {
    console.error("Error retrieving answer:", error);
  }

  return null;
}
