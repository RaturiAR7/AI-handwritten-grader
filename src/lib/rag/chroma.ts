import { Chroma } from "@langchain/community/vectorstores/chroma";
import { embeddings } from "./embed";

export async function getOrCreateVectorStore(examId: string) {
  return await Chroma.fromExistingCollection(embeddings, {
    collectionName: examId,
    url: "http://localhost:8000",
  });
}
