import { chunkText } from "./chunk";
import { createEmbedding } from "./embed";
import { chroma } from "./chroma";

export async function processAndStoreExam(examId: string, text: string) {
  try {
    const collection = await chroma.getOrCreateCollection({
      name: examId,
    });

    const chunks = chunkText(text);

    const ids: string[] = [];
    const embeddings: number[][] = [];
    const documents: string[] = [];
    const metadatas: any[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await createEmbedding(chunks[i]);

      ids.push(`${examId}-${i}`);
      embeddings.push(embedding);
      documents.push(chunks[i]);
      metadatas.push({ index: i });
    }

    await collection.add({
      ids,
      embeddings,
      documents,
      metadatas,
    });
  } catch (error) {
    console.error("Error processing and storing exam:", error);
    throw error;
  }
}
