import { NextResponse } from 'next/server';
import { genAI } from '@/lib/google';

export async function GET() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    await model.generateContent("ping");
    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Health Check Error:', error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 503 });
  }
}
