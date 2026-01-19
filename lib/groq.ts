import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY;

export const groq = new Groq({
  apiKey: apiKey || 'dummy_key', // Pour éviter que ça plante au build si pas de clé, mais il faudra une vraie clé pour que ça marche
});

export async function generateWithGroq(systemPrompt: string, userContent: string) {
  if (!apiKey) {
    throw new Error("Clé API Groq manquante (GROQ_API_KEY). Impossible d'utiliser le fallback.");
  }

  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    model: 'llama-3.3-70b-versatile', // Modèle à jour et performant sur Groq
    temperature: 0.7,
    response_format: { type: 'json_object' } // Groq supporte le mode JSON
  });

  return completion.choices[0]?.message?.content || '';
}
