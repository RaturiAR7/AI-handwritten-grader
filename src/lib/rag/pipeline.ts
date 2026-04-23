import { Document } from "@langchain/core/documents";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { embeddings } from "./embed";
import { extractQA } from "./extractQA";

export async function processAndStoreExam(examId: string, text: string) {
  const qaPairs = extractQA(text);

  if (!qaPairs.length) {
    throw new Error("No Q/A pairs extracted from PDF");
  }

  const docs = qaPairs
    .filter((item) => item.answer?.trim().length > 0)
    .map(
      (item) =>
        new Document({
          pageContent: item.answer.trim(),
          metadata: { examId, questionId: item.questionId },
        }),
    );

  await Chroma.fromDocuments(docs, embeddings, {
    collectionName: examId,
    url: "http://localhost:8000",
    collectionMetadata: { "hnsw:space": "cosine" },
  });
}
