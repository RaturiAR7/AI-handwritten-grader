import { Document } from "@langchain/core/documents";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { embeddings } from "./embed";
import { extractQA } from "./extractQA";

export async function processAndStoreExam(examId: string, text: string) {
  const qaPairs = extractQA(text);
  let docs: Document[] = [];

  if (qaPairs.length > 0) {
    // Exact match Q/A pairs found
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
    // No exact Q/A pairs, fallback to chunking the whole document for semantic search
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    console.log("Fall Back Used");
    docs = await splitter.createDocuments([text], [{ examId }]);
  }

  await Chroma.fromDocuments(docs, embeddings, {
    collectionName: examId,
    url: "http://localhost:8000",
    collectionMetadata: { "hnsw:space": "cosine" },
  });
}
