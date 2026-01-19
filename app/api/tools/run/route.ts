import { NextResponse } from 'next/server';
import { genAI, getEmbedding } from '@/lib/google';
import { generateWithGroq } from '@/lib/groq';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { promptTemplate, inputs } = await req.json();

    if (!promptTemplate || !inputs) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    // Remplacement des variables dans le template
    let finalPrompt = promptTemplate;
    let combinedInputText = "";

    for (const [key, value] of Object.entries(inputs)) {
      const valStr = String(value);
      finalPrompt = finalPrompt.replace(new RegExp(`{{${key}}}`, 'g'), valStr);
      combinedInputText += valStr + " ";
    }

    // --- RAG INTEGRATION ---
    // On cherche du contexte pertinent dans les PDF si l'input n'est pas vide
    let contextText = "";
    if (combinedInputText.trim().length > 5) {
        try {
            const queryEmbedding = await getEmbedding(combinedInputText);
            const { data: documents } = await supabase.rpc('match_documents', {
                query_embedding: queryEmbedding,
                match_threshold: 0.5,
                match_count: 3
            });

            if (documents && documents.length > 0) {
                contextText = documents.map((d: any) => d.content).join('\n---\n');
                console.log(`RAG: Found ${documents.length} chunks for tool execution.`);
            }
        } catch (ragError) {
            console.warn("RAG failed for tool, continuing without context:", ragError);
        }
    }

    // On injecte le contexte dans le prompt système ou au début du prompt utilisateur
    const augmentedPrompt = contextText 
        ? `CONTEXTE ISSU DES DOCUMENTS (à utiliser pour répondre) :\n${contextText}\n\nINSTRUCTION :\n${finalPrompt}`
        : finalPrompt;

    let text = '';
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await model.generateContent(augmentedPrompt);
        const response = await result.response;
        text = response.text();
    } catch (geminiError) {
        console.warn("Gemini tool run failed, trying Groq...", geminiError);
        try {
            text = await generateWithGroq("Tu es un assistant expert qui utilise le contexte fourni.", augmentedPrompt);
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
