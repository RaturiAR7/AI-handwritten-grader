import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export interface GradeResult {
  questionId: string;
  studentAnswer: string;
  correctAnswer: string;
  score: number;
  feedback: string;
}

export async function graderNode(
  ragResults: {
    questionId: string;
    studentAnswer: string;
    correctAnswer: string | null;
  }[],
): Promise<GradeResult[]> {
  const model = genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite-preview",
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
