import { PDFParse } from "pdf-parse";

export async function extractTextFromPDF(file: Uint8Array) {
  const parser = new PDFParse(file);
  const data = await parser.getText();
  const info = await parser.getInfo({ parsePageInfo: true });
  return { text: data?.text || "", info, numpages: info?.pages || 0 };
}
