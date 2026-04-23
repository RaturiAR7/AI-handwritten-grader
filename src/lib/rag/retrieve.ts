import { chroma } from "./chroma";
import { createEmbedding } from "./embed";

export async function retrieveFromChroma(examId: string, query: string, k = 3) {
  try {
    const collection = await chroma.getOrCreateCollection({
      name: examId,
    });

    const queryEmbedding = await createEmbedding(query);

    const result = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: k,
    });

    return result.documents?.[0] || [];
  } catch (error) {
    console.error("Error retrieving from Chroma:", error);
    throw error;
  }
}
