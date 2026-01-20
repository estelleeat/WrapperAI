import { NextResponse } from 'next/server';
import { genAI } from '@/lib/google';
import { generateWithGroq, transcribeAudio } from '@/lib/groq';
import { exec } from 'child_process';
import { promisify } from 'util';
import ytdl from '@distube/ytdl-core';
import { Innertube } from 'youtubei.js';

const execAsync = promisify(exec);

function extractVideoId(url: string): string | null {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?)|(shorts\/))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  
  // Si match[8] existe et fait 11 chars (standard YouTube ID)
  if (match && match[8] && match[8].length === 11) {
    return match[8];
  }
  
  // Fallback simple pour les URLs qui pourraient avoir l'ID juste après le dernier slash
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') return urlObj.pathname.slice(1);
    if (urlObj.pathname.startsWith('/shorts/')) return urlObj.pathname.split('/')[2];
    const v = urlObj.searchParams.get('v');
    if (v && v.length === 11) return v;
  } catch (e) {
    // Ignore URL parsing errors
  }

  return null;
}

async function getTranscriptWithPython(videoId: string): Promise<string> {
  const cmd = `python3 -m youtube_transcript_api ${videoId} --languages fr en --format json`;
  console.log(`Running python transcript: ${cmd}`);
  
  try {
    const { stdout, stderr } = await execAsync(cmd);
    
    if (!stdout || stdout.trim() === "") {
        throw new Error("Le script Python n'a retourné aucune donnée.");
    }

    // Vérifier si le début ressemble à du JSON
    const trimmedStdout = stdout.trim();
    if (!trimmedStdout.startsWith('[') && !trimmedStdout.startsWith('{')) {
        // C'est probablement un message d'erreur en texte brut
        throw new Error(trimmedStdout.split('\n')[0]); 
    }

    const data = JSON.parse(trimmedStdout);
    let transcriptData = data;
    
    if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
        transcriptData = data[0];
    }
    
    if (Array.isArray(transcriptData)) {
        return transcriptData.map((item: any) => item.text).join(' ');
    }
    
    throw new Error('Format JSON inattendu du script Python');

  } catch (error: any) {
    console.error("Python extraction error:", error.message);
    
    // Si c'est une erreur d'exécution du process (ex: 429)
    if (error.stderr) {
        if (error.stderr.includes('TranscriptsDisabled')) {
            throw new Error("Les sous-titres sont désactivés pour cette vidéo.");
        }
        if (error.stderr.includes('Too Many Requests') || error.stderr.includes('429')) {
            throw new Error("YouTube bloque temporairement les requêtes (429).");
        }
        if (error.stderr.includes('VideoUnavailable')) {
            throw new Error("La vidéo est indisponible ou privée.");
        }
    }
    
    throw error;
  }
}

async function transcribeYoutubeAudio(url: string): Promise<string> {
  console.log(`Starting Whisper transcription for: ${url}`);
  let audioUrl = "";
  let mimeType = "audio/mp4";

  // Tentative 1: ytdl-core
  try {
    const info = await ytdl.getInfo(url);
    const format = ytdl.chooseFormat(info.formats, { filter: 'audioonly', quality: 'lowestaudio' });
    if (format && format.url) {
        audioUrl = format.url;
        mimeType = format.mimeType || "audio/mp4";
        console.log("Audio URL found with ytdl-core");
    }
  } catch (e: any) {
    console.warn("ytdl-core failed to get info, trying youtubei.js...", e.message);
  }

  // Tentative 2: youtubei.js (si ytdl a échoué)
  if (!audioUrl) {
    try {
        const youtube = await Innertube.create();
        const videoId = extractVideoId(url);
        if (videoId) {
            const info = await youtube.getBasicInfo(videoId);
            const format = info.streaming_data?.adaptive_formats.find(f => f.has_audio && !f.has_video);
            if (format && format.decipher(youtube.session.player)) {
                audioUrl = format.url;
                mimeType = format.mime_type;
                console.log("Audio URL found with youtubei.js");
            }
        }
    } catch (e: any) {
        console.error("youtubei.js also failed:", e.message);
    }
  }

  if (!audioUrl) {
    throw new Error("Impossible d'extraire le flux audio de la vidéo (blocage YouTube).");
  }

  try {
    console.log(`Downloading audio for Whisper...`);
    const response = await fetch(audioUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://www.youtube.com/',
        }
    });
    
    if (!response.ok) throw new Error(`Status ${response.status}`);

    const blob = await response.blob();
    const file = new File([blob], 'audio.m4a', { type: mimeType.split(';')[0] });
    
    console.log(`Sending to Groq Whisper (${Math.round(blob.size / 1024 / 1024)} MB)...`);
    return await transcribeAudio(file);
  } catch (error: any) {
    console.error("Whisper download/transcribe error:", error.message);
    throw new Error(`Échec final du fallback: ${error.message}`);
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
         console.warn('Python transcript failed, trying Whisper fallback...', e.message);
         try {
            fullText = await transcribeYoutubeAudio(url);
            console.log(`Whisper transcript success (${fullText.length} chars)`);
         } catch (whisperError: any) {
            console.error('All transcript methods failed:', whisperError);
            return NextResponse.json(
              { error: `Extraction automatique échouée (${e.message}). Le fallback Whisper a aussi échoué: ${whisperError.message}.` },
              { status: 422 }
            );
         }
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
    let parsedContent;

    while (retryCount < maxRetries) {
      try {
        result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        if (!text) throw new Error("Réponse vide de Gemini");
        parsedContent = JSON.parse(text);
        break; // Succès
      } catch (e: any) {
        // Si erreur quota ou serveur (429/503), on retry un peu
        if ((e.message?.includes('429') || e.message?.includes('503')) && retryCount < maxRetries - 1) {
          retryCount++;
          const delay = Math.pow(2, retryCount) * 1000 + (Math.random() * 1000);
          console.log(`Quota 429/503 hit. Retrying in ${Math.round(delay)}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // Si c'est le dernier essai ou une autre erreur, on tente le FALLBACK GROQ
          console.warn("Gemini failed, switching to Groq fallback...", e.message);
          try {
             const groqResponse = await generateWithGroq(
                "Tu es un expert en marketing de contenu. Réponds UNIQUEMENT au format JSON.", 
                prompt
             );
             parsedContent = JSON.parse(groqResponse);
             console.log("✅ Groq fallback success");
             break; // Sortir de la boucle de retry Gemini car on a réussi avec Groq
          } catch (groqError: any) {
             console.error("❌ Groq fallback failed:", groqError.message);
             throw e; // On renvoie l'erreur originale de Gemini si tout échoue
          }
        }
      }
    }
    
    if (!parsedContent) throw new Error("Échec de la génération (Gemini & Groq)");

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
