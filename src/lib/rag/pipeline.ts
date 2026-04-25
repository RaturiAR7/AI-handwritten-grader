import { Document } from "@langchain/core/documents";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { embeddings } from "./embed";
import { extractQA } from "./extractQA";

// In-memory store persists during server lifetime

const g = global as any;
if (!g.vectorStores) g.vectorStores = {};
const vectorStores = g.vectorStores;
export async function processAndStoreExam(examId: string, text: string) {
  try {
    let qaPairs = extractQA(text); // removed qaPairs = []
    let docs: Document[] = [];
    qaPairs = [];
    if (qaPairs.length > 0) {
      console.log("Using Q/A pairs:", qaPairs.length);
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
      console.log("Fallback: chunking document");
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      docs = await splitter.createDocuments([text], [{ examId }]);
      docs = docs.filter((d) => d.pageContent.trim().length > 0);
    }

    vectorStores[examId] = await MemoryVectorStore.fromDocuments(
      docs,
      embeddings,
    );
    console.log("✅ Stored in memory:", docs.length, "documents");
  } catch (error) {
    console.log(error);
  }
}

export function getVectorStore(examId: string): MemoryVectorStore | null {
  return vectorStores[examId] || null;
}
