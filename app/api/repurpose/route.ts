import { NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';
import { genAI } from '@/lib/google';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL manquante' }, { status: 400 });
    }

    // 1. Récupération du Transcript
    let transcriptItems;
    try {
      transcriptItems = await YoutubeTranscript.fetchTranscript(url);
    } catch (e) {
      console.error('Transcript error:', e);
      return NextResponse.json(
        { error: 'Impossible de récupérer la transcription de cette vidéo.' },
        { status: 422 }
      );
    }

    const fullText = transcriptItems.map((item) => item.text).join(' ');
    // Gemini 1.5 a une énorme fenêtre de contexte, on peut être plus généreux qu'avec GPT-4
    const truncatedText = fullText.slice(0, 40000); 

    // 2. Configuration du Modèle Gemini
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    // 3. Préparation du Prompt
    const prompt = `
      Tu es un expert en marketing de contenu.
      Ton but est de reformuler une transcription vidéo en 3 formats distincts.
      
      Voici la transcription :
      "${truncatedText}"

      Réponds UNIQUEMENT avec ce schéma JSON :
      {
        "blogPost": "Code HTML complet de l'article (h1, h2, p, ul). Ton informel et éducatif.",
        "twitterThread": ["Tweet 1", "Tweet 2", "Tweet 3..."],
        "linkedinPost": "Texte professionnel avec emojis et sauts de ligne."
      }
    `;

    // 4. Appel Google Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error("Pas de réponse de l'IA");
    }

    const parsedContent = JSON.parse(text);

    return NextResponse.json(parsedContent);

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur interne serveur' },
      { status: 500 }
    );
  }
}
