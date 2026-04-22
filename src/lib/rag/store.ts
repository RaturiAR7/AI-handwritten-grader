import { chroma } from "./chroma";
import { chunkText } from "./chunk";
import { createEmbedding } from "./embed";

export async function storeInChroma(examId: string, text: string) {
  const collection = await chroma.getOrCreateCollection({
    name: examId,
  });

  const chunks = chunkText(text);

  for (let i = 0; i < chunks.length; i++) {
    const embedding = await createEmbedding(chunks[i]);

    await collection.add({
      ids: [`${examId}-${i}`],
      embeddings: [embedding],
      documents: [chunks[i]],
      metadatas: [
        {
          index: i,
        },
      ],
    });
  }
}
