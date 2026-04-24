import { GoogleGenerativeAI } from "@google/generative-ai";
import { ExtractedAnswer } from "@/constants/types";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function visionNode(
  imageBase64: string,
  modelName: string = "gemini-1.5-flash"
): Promise<ExtractedAnswer[]> {
  const model = genAI.getGenerativeModel({
    model: modelName,
  });

  const prompt = `
    You are analyzing a handwritten exam answer sheet.
    Extract all question numbers, their corresponding answers, and the question text if it is present.
    Return ONLY a JSON array in this exact format, nothing else:
    [
      { "questionId": "Q1", "studentAnswer": "answer text here", "questionText": "question text if present, otherwise omit" },
      { "questionId": "Q2", "studentAnswer": "answer text here", "questionText": "question text if present, otherwise omit" }
    ]
    If an answer is blank or illegible, use an empty string for studentAnswer.
  `;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64,
      },
    },
  ]);

  const text = result.response.text();

  // Strip markdown code fences if present
  const cleaned = text.replace(/```json|```/g, "").trim();
  const parsed: ExtractedAnswer[] = JSON.parse(cleaned);

  return parsed;
}
