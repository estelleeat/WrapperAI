import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.warn("GOOGLE_API_KEY is not defined in environment variables");
}

export const genAI = new GoogleGenerativeAI(apiKey || "");

export async function getEmbedding(text: string) {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(text);
  return result.embedding.values;
}
