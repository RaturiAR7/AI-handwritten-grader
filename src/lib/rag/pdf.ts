import pdfParse from "pdf-parse";

export async function extractTextFromPDF(file: Uint8Array) {
  const data = await pdfParse(Buffer.from(file));

  return {
    text: data.text || "",
    info: data.info,
    numpages: data.numpages || 0,
  };
}
