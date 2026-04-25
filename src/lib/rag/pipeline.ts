import { Document } from "@langchain/core/documents";
import { ChromaClient } from "chromadb";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { embedder } from "./embed";
import { extractQA } from "./extractQA";

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
      console.log("Q/A pairs:", qaPairs.length);
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
    const client = new ChromaClient({ host: "localhost", port: 8000 });
    try {
      await client.deleteCollection({ name: examId });
    } catch (_) {}
    const collection = await client.createCollection({ name: examId });

    await collection.add({
      ids: docs.map((_, i) => `${examId}-${i}`),
      embeddings: embeddingVectors,
      documents: finalDocs,
      metadatas: docs.map((d) => sanitizeMetadata(d.metadata)),
    });

    console.log("Stored:", await collection.count());
  } catch (error) {
    console.log(error);
  }
}
