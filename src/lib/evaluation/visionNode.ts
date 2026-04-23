import { GoogleGenerativeAI } from "@google/generative-ai";
import { ExtractedAnswer } from "@/constants/types";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function visionNode(
  imageBase64: string,
): Promise<ExtractedAnswer[]> {
  const model = genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite-preview",
  });

  const prompt = `
    You are analyzing a handwritten exam answer sheet.
    Extract all question numbers and their corresponding answers.
    Return ONLY a JSON array in this exact format, nothing else:
    [
      { "questionId": "Q1", "studentAnswer": "answer text here" },
      { "questionId": "Q2", "studentAnswer": "answer text here" }
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
