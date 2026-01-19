import { NextResponse } from 'next/server';
import { genAI } from '@/lib/google';
import { generateWithGroq } from '@/lib/groq';

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

    let text = '';
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await model.generateContent(finalPrompt);
        const response = await result.response;
        text = response.text();
    } catch (geminiError) {
        console.warn("Gemini tool run failed, trying Groq...", geminiError);
        try {
            text = await generateWithGroq("Tu es un assistant utile.", finalPrompt);
        } catch (groqError: any) {
            throw new Error(`Échec exécution outil: ${groqError.message}`);
        }
    }

    return NextResponse.json({ result: text });

  } catch (error: any) {
    console.error('Tool Run Error:', error);
    return NextResponse.json(
      { error: error.message || "Erreur d'exécution" },
      { status: 500 }
    );
  }
}
