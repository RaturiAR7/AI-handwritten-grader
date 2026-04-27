import { Document } from "@langchain/core/documents";
import { ChromaClient } from "chromadb";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { embedder } from "./embed";
import { extractQA } from "./extractQA";

/// loops through a metadata object and strips out anything that would cause an error for chromadb
function sanitizeMetadata(
  metadata: Record<string, any>,
): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      result[key] = value;
    }
  }
  return result;
}

export async function processAndStoreExam(examId: string, text: string) {
  try {
    const qaPairs = extractQA(text); // no qaPairs = []
    let docs: Document[] = [];

    if (qaPairs.length > 0) {
      docs = qaPairs
        .filter((item) => item.answer?.trim().length > 0)
        .map(
          (item) =>
            new Document({
              pageContent: item.answer.trim(),
              metadata: { examId, questionId: item.questionId },
            }),
        );
    } else {
      console.log("Fall Back Used");
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      docs = await splitter.createDocuments([text], [{ examId }]);
      docs = docs.filter((d) => d.pageContent.trim().length > 0);
    }

    const finalDocs = docs.map((d) => d.pageContent);
    const embeddingVectors = await embedder.embedDocuments(finalDocs);
    console.log("Vector count:", embeddingVectors.length);
    console.log("Vector dim:", embeddingVectors[0]?.length);

    // Store in ChromaDB
    const client = new ChromaClient({
      host: process.env.CHROMA_HOST,
      port: 8000,
    });
    try {
      //// Delete if folder exists
      await client.deleteCollection({ name: examId });
    } catch (_) {}
    //// Creates a new "folder" (collection) in the database specifically for this exam.
    /// Semantic Search
    const collection = await client.createCollection({
      name: examId,
      embeddingFunction: undefined,
      metadata: { "hnsw:space": "cosine" },
    });

    await collection.add({
      //// IDs: Unique strings to identify each chunk.
      ids: docs.map((_, i) => `${examId}-${i}`),
      embeddings: embeddingVectors,
      documents: finalDocs,
      //// metadata for search based on examid
      metadatas: docs.map((d) => sanitizeMetadata(d.metadata)),
    });

    console.log("Stored:", await collection.count());
  } catch (error) {
    console.log(error);
  }
}
