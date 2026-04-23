import { createEmbedding } from "./embed";
import { chromaClient } from "./chroma";
import { extractQA } from "./extractQA";

export async function processAndStoreExam(examId: string, text: string) {
  try {
    const collection = await chromaClient.getOrCreateCollection({
      name: examId,
    });
    const qaPairs = extractQA(text);
    console.log("QA pairs count:", qaPairs.length); // Is this 0?
    const ids: string[] = [];
    const embeddings: number[][] = [];
    const documents: string[] = [];
    const metadatas: any[] = [];

    for (const item of qaPairs) {
      const embedding = await createEmbedding(item.answer);

      ids.push(`${examId}-${item.questionId}`);
      embeddings.push(embedding);
      documents.push(item.answer);

      metadatas.push({
        examId,
        questionId: item.questionId,
      });
    }
    if (!ids.length) {
      throw new Error("No Q/A pairs extracted from PDF");
    }

    await collection.add({
      ids,
      embeddings,
      documents,
      metadatas,
    });
  } catch (error) {
    console.error("Error processing exam:", error);
    throw error;
  }
}
