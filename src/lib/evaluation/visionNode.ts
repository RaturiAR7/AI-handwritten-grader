import { GoogleGenerativeAI } from "@google/generative-ai";
import { ExtractedAnswer, VISION_PROMPT } from "@/constants/index";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function visionNode(
  imagesBase64: string[],
  modelName: string = "gemini-1.5-flash"
): Promise<ExtractedAnswer[]> {
  const model = genAI.getGenerativeModel({
    model: modelName,
  });

  const prompt = VISION_PROMPT;

  const imageParts = imagesBase64.map((base64) => ({
    inlineData: {
      mimeType: "image/jpeg",
      data: base64,
    },
  }));

  const result = await model.generateContent([
    prompt,
    ...imageParts
  ]);

  const text = result.response.text();

  // Strip markdown code fences if present
  const cleaned = text.replace(/```json|```/g, "").trim();
  const parsed: ExtractedAnswer[] = JSON.parse(cleaned);

  return parsed;
}
