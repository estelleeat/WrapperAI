import { NextResponse } from 'next/server';
import { genAI } from '@/lib/google';
import { generateWithGroq } from '@/lib/groq';

export async function GET() {
  let geminiStatus = 'down';
  let groqStatus = 'down';
  let errorDetails = '';
  const skipGemini = process.env.DISABLE_GEMINI_HEALTHCHECK === 'true';

  // Test Gemini
  if (skipGemini) {
    geminiStatus = 'skipped';
  } else {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      await model.generateContent("ping");
      geminiStatus = 'ok';
    } catch (error: any) {
      console.error('❌ Gemini Health Check FAILED:', error.message); // LOG VISIBLE TERMINAL
      errorDetails += `Gemini: ${error.message}; `;
    }
  }

  // Test Groq
  try {
    await generateWithGroq("System", "ping", false);
    groqStatus = 'ok';
  } catch (error: any) {
    console.error('❌ Groq Health Check FAILED:', error.message); // LOG VISIBLE TERMINAL
    errorDetails += `Groq: ${error.message}; `;
  }

  if (geminiStatus === 'ok' || groqStatus === 'ok') {
    return NextResponse.json({ status: 'operational', gemini: geminiStatus, groq: groqStatus });
  }

  return NextResponse.json({ status: 'down', message: errorDetails }, { status: 503 });
}
