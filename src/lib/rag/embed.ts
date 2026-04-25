import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

export const embedder = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY || "dummy-key-for-build",
  model: "gemini-embedding-2-preview",
});
