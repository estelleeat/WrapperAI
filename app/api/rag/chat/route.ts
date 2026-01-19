import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { genAI, getEmbedding } from '@/lib/google';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message manquant' }, { status: 400 });
    }

    // 1. Vectorisation de la question
    const queryEmbedding = await getEmbedding(message);

    // 2. Recherche des documents similaires (RAG)
    const { data: documents, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5, // Seuil de similarité (ajuster selon besoin)
      match_count: 5 // Nombre de chunks à récupérer
    });

    if (error) {
      console.error('Supabase search error:', error);
      throw new Error('Erreur lors de la recherche documentaire');
    }

    // 3. Construction du Contexte
    const contextText = documents
      ?.map((doc: any) => doc.content)
      .join('\n---\n');

    const systemPrompt = `
      Tu es un expert technique spécialisé dans les appels d\'offres.
      Tu dois répondre à la question de l'utilisateur en te basant UNIQUEMENT sur le contexte fourni ci-dessous.
      Si la réponse ne se trouve pas dans le contexte, dis poliment que tu ne trouves pas l'information dans les documents fournis.
      
      Contexte :
      ${contextText}
    `;

    // 4. Génération de la réponse
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    let result;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        result = await model.generateContent([
          systemPrompt, 
          `Question utilisateur : ${message}`
        ]);
        break;
      } catch (e: any) {
        if (e.message?.includes('429') && retryCount < maxRetries - 1) {
          retryCount++;
          const delay = Math.pow(2, retryCount) * 1000 + (Math.random() * 1000);
          console.log(`Quota 429 hit (Chat). Retrying in ${Math.round(delay)}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw e;
        }
      }
    }

    if (!result) throw new Error("Échec de la génération après plusieurs tentatives (Quota ?)");

    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      answer: text, 
      sources: documents?.map((d: any) => d.metadata.filename) // Retourner les sources
    });

  } catch (error: any) {
    console.error('Chat Error Details:', error);
    
    if (error.message?.includes('Invalid API key') || error.code === 'PGRST301') {
      return NextResponse.json({ error: 'Clé API Supabase invalide ou expirée.' }, { status: 401 });
    }

    console.error('Stack trace:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Erreur interne serveur' },
      { status: 500 }
    );
  }
}
