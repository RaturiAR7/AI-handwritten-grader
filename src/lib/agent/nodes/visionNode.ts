import { GoogleGenerativeAI } from "@google/generative-ai";
import { ExtractedAnswer, VISION_PROMPT } from "@/constants/index";
import { ExamGradingStateType } from "../states";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function visionNode(
  state: ExamGradingStateType,
): Promise<Partial<ExamGradingStateType>> {
  console.log(
    "[Agent] visionNode: extracting answers from",
    state.imagesBase64.length,
    "image(s)",
  );

  try {
    const model = genAI.getGenerativeModel({ model: state.modelName });

    const imageParts = state.imagesBase64.map((base64) => ({
      inlineData: { mimeType: "image/jpeg", data: base64 },
    }));

    const result = await model.generateContent([VISION_PROMPT, ...imageParts]);
    const text = result.response.text();
    const cleaned = text.replace(/```json|```/g, "").trim();
    const extractedAnswers: ExtractedAnswer[] = JSON.parse(cleaned);

    console.log(
      "[Agent] visionNode: extracted",
      extractedAnswers.length,
      "answers",
    );
    return { extractedAnswers };
  } catch (error: any) {
    console.error("[Agent] visionNode failed:", error.message);
    return { error: `Vision extraction failed: ${error.message}` };
  }
}
