import { ChromaClient } from "chromadb";

export async function getAnswerByQuestionId(
  examId: string,
  questionId: string,
) {
  const client = new ChromaClient({ host: "localhost", port: 8000 });
  const col = await client.getCollection({ name: examId });

  const result = await col.get({
    where: { questionId: `Q${questionId}` }, // filter by metadata
  });

  return result.documents?.[0] || null;
}
