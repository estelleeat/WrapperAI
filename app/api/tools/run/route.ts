import { NextResponse } from 'next/server';
import { genAI } from '@/lib/google';

export async function POST(req: Request) {
  try {
    const { promptTemplate, inputs } = await req.json();

    if (!promptTemplate || !inputs) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    // Remplacement des variables dans le template
    let finalPrompt = promptTemplate;
    for (const [key, value] of Object.entries(inputs)) {
      finalPrompt = finalPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value as string);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ result: text });

  } catch (error: any) {
    console.error('Tool Run Error:', error);
    return NextResponse.json(
      { error: error.message || "Erreur d'exécution" },
      { status: 500 }
    );
  }
}
