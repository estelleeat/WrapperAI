import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.warn("GOOGLE_API_KEY is not defined in environment variables");
}

export const genAI = new GoogleGenerativeAI(apiKey || "");

export async function getEmbedding(text: string, retries = 3) {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (error: any) {
      if (error.message?.includes('429') && i < retries - 1) {
        // Attendre 2s, 4s, 8s...
        const delay = Math.pow(2, i + 1) * 1000;
        console.log(`Rate limit hit. Retrying in ${delay}ms...`);
        await new Promise(res => setTimeout(res, delay));
        continue;
      }
      throw error;
    }
  }
}
