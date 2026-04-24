import { GoogleGenerativeAI } from "@google/generative-ai";
import { ExtractedAnswer, VISION_PROMPT } from "@/constants/index";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function visionNode(
  imageBase64: string,
  modelName: string = "gemini-1.5-flash"
): Promise<ExtractedAnswer[]> {
  const model = genAI.getGenerativeModel({
    model: modelName,
  });

  const prompt = VISION_PROMPT;

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
