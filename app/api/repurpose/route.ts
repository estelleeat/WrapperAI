import { NextResponse } from 'next/server';
import { genAI } from '@/lib/google';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

function extractVideoId(url: string): string | null {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

async function getTranscriptWithPython(videoId: string): Promise<string> {
  // On utilise 'python3' ou 'python' selon l'environnement
  const cmd = `python3 -m youtube_transcript_api ${videoId} --languages fr en --format json`;
  console.log(`Running python transcript: ${cmd}`);
  
  try {
    const { stdout, stderr } = await execAsync(cmd);
    if (stderr && stderr.includes('Error')) {
       console.warn('Python stderr:', stderr);
    }
    
    // Le stdout contient le JSON
    const data = JSON.parse(stdout);
    
    // Le CLI retourne une liste de transcripts (un par ID vidéo).
    // Structure: [[{text: "...", ...}, ...]]
    let transcriptData = data;
    
    // Si data est un tableau dont le premier élément est aussi un tableau, on prend le premier
    if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
        transcriptData = data[0];
    }
    
    // Si c'est une liste d'objets {text, start, duration}
    if (Array.isArray(transcriptData)) {
        return transcriptData.map((item: any) => item.text).join(' ');
    }
    
    throw new Error('Format JSON inattendu du script Python');

  } catch (error: any) {
    console.error("Python script error:", error.message);
    // Gestion spécifique des erreurs courantes
    if (error.stderr?.includes('TranscriptsDisabled')) {
        throw new Error("Les sous-titres sont désactivés pour cette vidéo.");
    }
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const { url, text: manualText } = await req.json();

    if (!url && !manualText) {
      return NextResponse.json({ error: 'URL ou texte manquant' }, { status: 400 });
    }

    let fullText = manualText || '';

    // Si on a une URL mais pas de texte manuel, on essaie de récupérer le transcript
    if (url && !manualText) {
      console.log(`Processing URL: ${url}`);
      const videoId = extractVideoId(url);
      
      if (!videoId) {
        return NextResponse.json({ error: 'URL YouTube invalide' }, { status: 400 });
      }

      try {
        fullText = await getTranscriptWithPython(videoId);
        console.log(`Transcript extracted (${fullText.length} chars)`);
      } catch (e: any) {
         console.error('Transcript extraction failed:', e);
         return NextResponse.json(
          { error: `Extraction automatique échouée (${e.message}). YouTube bloque parfois les requêtes. Veuillez utiliser l'option 2 (Copier/Coller).` },
          { status: 422 }
        );
      }
    }

    if (!fullText.trim()) {
       return NextResponse.json(
        { error: 'Le contenu texte est vide.' },
        { status: 422 }
      );
    }


    // On réduit la taille pour éviter le "Token Limit" (429) du tier gratuit
    const truncatedText = fullText.slice(0, 15000); 
    console.log(`Sending ${truncatedText.length} chars to Gemini...`);

    // 2. Configuration du Modèle Gemini
    // Utilisation de l'alias stable pour éviter les erreurs de version
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
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

    // 4. Appel Google Gemini avec Retry
    let result;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        result = await model.generateContent(prompt);
        break; // Succès, on sort de la boucle
      } catch (e: any) {
        if (e.message?.includes('429') && retryCount < maxRetries - 1) {
          retryCount++;
          const delay = Math.pow(2, retryCount) * 1000 + (Math.random() * 1000); // 2s, 4s... + jitter
          console.log(`Quota 429 hit. Retrying in ${Math.round(delay)}ms (Attempt ${retryCount}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw e; // Erreur fatale ou max retries atteints
        }
      }
    }
    
    if (!result) throw new Error("Échec après plusieurs tentatives");

    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error("Pas de réponse de l'IA");
    }

    const parsedContent = JSON.parse(text);

    return NextResponse.json(parsedContent);

  } catch (error: any) {
    console.error('API Error:', error);
    
    let errorMessage = error.message || 'Erreur interne serveur';
    let status = 500;

    if (error.message.includes('429') || error.status === 429) {
      errorMessage = 'Quota Google AI dépassé. Veuillez réessayer dans une minute.';
      status = 429;
    } else if (error.message.includes('503')) {
      errorMessage = 'Service Google AI temporairement indisponible.';
      status = 503;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: status }
    );
  }
}
