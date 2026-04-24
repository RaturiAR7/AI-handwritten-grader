import { GoogleGenerativeAI } from "@google/generative-ai";
import { GradeResult, graderNodeParams } from "@/constants/types";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function graderNode(
  ragResults: graderNodeParams[],
  modelName: string = "gemini-1.5-flash"
): Promise<GradeResult[]> {
  const model = genAI.getGenerativeModel({
    model: modelName,
  });

  const context = ragResults
    .map(
      (item) => `
      Question ID: ${item.questionId}
      Correct Answer: ${item.correctAnswer ?? "N/A"}
      Student Answer: ${item.studentAnswer}
    `,
    )
    .join("\n---\n");

  const prompt = `
    You are a strict but fair exam grader.
    Grade each question below from 0 to 10 based on:
    - Accuracy (is the core answer correct?)
    - Completeness (did they cover all key points?)
    - Allow for minor spelling/phrasing differences

    ${context}

    Return ONLY a JSON array, nothing else:
    [
      {
        "questionId": "Q1",
        "score": <number 0-10>,
        "feedback": "<one sentence explanation>"
      }
    ]
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const cleaned = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);

  // Merge scores back with original data
  return parsed.map((item: any) => {
    const original = ragResults.find((r) => r.questionId === item.questionId);
    return {
      questionId: item.questionId,
      studentAnswer: original?.studentAnswer ?? "",
      correctAnswer: original?.correctAnswer ?? "N/A",
      score: item.score,
      feedback: item.feedback,
    };
  });
}
