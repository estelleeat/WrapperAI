import { NextResponse } from 'next/server';
import { genAI } from '@/lib/google';
import { generateWithGroq } from '@/lib/groq';

export async function POST(req: Request) {
  try {
    const { description } = await req.json();

    if (!description) {
      return NextResponse.json({ error: 'Description manquante' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const systemPrompt = `
      Tu es un architecte logiciel expert en création d'outils no-code.
      Ton but est de transformer une demande utilisateur en une configuration d'outil au format JSON strict.
      
      Demande utilisateur : "${description}"

      Tu dois générer un objet JSON avec cette structure exacte :
      {
        "name": "Nom court et accrocheur de l'outil",
        "description": "Courte description de ce que fait l'outil",
        "inputs": [
          { 
            "key": "nom_variable", 
            "label": "Libellé pour l'utilisateur", 
            "type": "text" | "textarea" | "select", 
            "options": ["Option 1", "Option 2"] // Seulement si type est 'select'
          }
        ],
        "promptTemplate": "Le prompt système que l'IA utilisera pour générer le résultat. Utilise {{nom_variable}} pour insérer les valeurs."
      }

      Exemple pour 'Générateur de mail' :
      {
        "name": "Cold Email Pro",
        "description": "Génère des emails de prospection personnalisés",
        "inputs": [
          { "key": "targetName", "label": "Nom du prospect", "type": "text" },
          { "key": "tone", "label": "Ton", "type": "select", "options": ["Amical", "Formel"] }
        ],
        "promptTemplate": "Rédige un email de prospection pour {{targetName}} avec un ton {{tone}}."
      }

      Réponds UNIQUEMENT le JSON. Pas de markdown, pas de texte avant/après.
    `;

    // Retry logic with Groq Fallback
    let text = '';
    try {
        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        text = response.text();
    } catch (geminiError) {
        console.warn("Gemini tool gen failed, trying Groq...", geminiError);
        try {
            text = await generateWithGroq("Tu es un expert JSON. Réponds uniquement avec le JSON demandé.", systemPrompt);
        } catch (groqError: any) {
            throw new Error(`Échec génération outil: ${groqError.message}`);
        }
    }
    
    // Nettoyage agressif
    let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        cleanText = jsonMatch[0];
    }

    let toolConfig;
    try {
        toolConfig = JSON.parse(cleanText);
    } catch (parseError) {
        console.error("JSON Parse Error. Raw text:", text);
        throw new Error("L'IA a généré un format invalide. Réessayez.");
    }

    return NextResponse.json(toolConfig);

  } catch (error: any) {
    console.error('Tool Gen Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur de génération' },
      { status: 500 }
    );
  }
}
