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

    console.log("Inputs received:", inputs);

    for (const [key, value] of Object.entries(inputs)) {
      const valStr = String(value);
      // Utilisation de split/join au lieu de RegExp pour éviter les erreurs avec les caractères spéciaux
      finalPrompt = finalPrompt.split(`{{${key}}}`).join(valStr);
      combinedInputText += valStr + " ";
    }

    console.log("Final prompt after replacement:", finalPrompt);

    // --- RAG INTEGRATION ---
    // On cherche du contexte pertinent dans les PDF si l'input n'est pas vide
    let contextText = "";
    let foundDocs: any[] = [];

    if (combinedInputText.trim().length > 5) {
        try {
            const queryEmbedding = await getEmbedding(combinedInputText);
            const { data: documents } = await supabase.rpc('match_documents', {
                query_embedding: queryEmbedding,
                match_threshold: 0.5,
                match_count: 3
            });

            if (documents && documents.length > 0) {
                foundDocs = documents;
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
            // Mode texte pour l'exécution (pas de JSON forcé)
            text = await generateWithGroq("Tu es un assistant expert.", augmentedPrompt, false);
        } catch (groqError: any) {
            throw new Error(`Échec exécution outil: ${groqError.message}`);
        }
    }

    return NextResponse.json({ 
        result: text,
        sources: foundDocs?.map((d: any) => d.metadata?.filename).filter(Boolean) || []
    });

  } catch (error: any) {
    console.error('Tool Run Error:', error);
    return NextResponse.json(
      { error: error.message || "Erreur d'exécution" },
      { status: 500 }
    );
  }
}
