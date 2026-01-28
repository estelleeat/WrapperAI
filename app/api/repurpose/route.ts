import { NextResponse } from 'next/server';
import { genAI } from '@/lib/google';
import { generateWithGroq, transcribeAudio } from '@/lib/groq';
import { execSync } from 'child_process';
import ytdl from '@distube/ytdl-core';
import { Innertube } from 'youtubei.js';

// Force runtime Node (pas Edge) pour autoriser child_process / yt-dlp
export const runtime = 'nodejs';

const DEFAULT_YT_USER_AGENT =
  process.env.YT_USER_AGENT ||
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

type BasicInfo = {
  short_description?: string;
  description?: string | { toString(): string };
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
    return (error as { message: string }).message;
  }
  return 'Unknown error';
}

function getStatusCode(error: unknown): number | undefined {
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status?: unknown }).status;
    if (typeof status === 'number') return status;
  }
  return undefined;
}

function extractVideoId(url: string): string | null {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?)|(shorts\/))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && (match[8] || match[7]).length === 11) ? (match[8] || match[7]) : null;
}

async function getVideoDescription(url: string, videoId?: string): Promise<string | null> {
  try {
    const info = await ytdl.getInfo(url, {
      requestOptions: {
        headers: { 'User-Agent': DEFAULT_YT_USER_AGENT },
      },
    });
    const desc = info?.videoDetails?.shortDescription || info?.videoDetails?.description;
    if (desc && desc.trim()) {
      return desc;
    }
  } catch (error: unknown) {
    console.warn('ytdl description fetch failed:', getErrorMessage(error));
  }

  if (!videoId) return null;

  try {
    const youtube = await Innertube.create();
    const info = await youtube.getInfo(videoId);
    const basicInfo = (info as { basic_info?: BasicInfo }).basic_info;
    const rawDesc = basicInfo?.short_description ?? basicInfo?.description;
    const desc = typeof rawDesc === 'string' ? rawDesc : rawDesc?.toString?.();
    if (desc && desc.trim()) {
      return desc;
    }
  } catch (error: unknown) {
    console.warn('Innertube description fetch failed:', getErrorMessage(error));
  }

  return null;
}

async function transcribeYoutubeAudio(url: string): Promise<string> {
  console.log(`Starting Whisper transcription with yt-dlp for: ${url}`);
  
  try {
    const pythonBin = process.env.PYTHON_BIN || 'python3';
    const userAgent = DEFAULT_YT_USER_AGENT;
    const proxy = process.env.YT_PROXY ? ` --proxy ${process.env.YT_PROXY}` : '';
    const cookies = process.env.YT_COOKIES_FILE ? ` --cookies ${process.env.YT_COOKIES_FILE}` : '';
    const extra = process.env.YT_DLP_EXTRA ? ` ${process.env.YT_DLP_EXTRA}` : '';

    // --user-agent et --cookies aident à contourner certains blocages.
    // L'option proxy permet d'utiliser un endpoint résidentiel dédié si besoin.
    const cmd = [
      `${pythonBin} -m yt_dlp`,
      '-f "ba[ext=m4a]/ba/bestaudio"',
      '--geo-bypass',
      '--no-check-certificates',
      '--no-playlist',
      '--extractor-args "youtube:player_client=android,ios"',
      '--user-agent',
      `"${userAgent}"`,
      cookies,
      proxy,
      extra,
      '-o -',
      `"${url}"`,
    ]
      .filter(Boolean)
      .join(' ');

    console.log(`Running: ${cmd}`);
    const buffer = execSync(cmd, {
      maxBuffer: 50 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env },
    });

    if (!buffer || buffer.length === 0) {
        throw new Error("Aucune donnée audio reçue.");
    }

    console.log(`Audio downloaded (${Math.round(buffer.length / 1024 / 1024)} MB). Sending to Whisper...`);
    
    const file = new File([buffer], 'audio.m4a', { type: 'audio/mp4' });
    return await transcribeAudio(file);

  } catch (error: unknown) {
    const msg = getErrorMessage(error);
    console.error("Whisper yt-dlp fallback error:", msg);

    if (msg.includes('HTTP Error 429') || msg.includes('Too Many Requests')) {
      throw new Error("YouTube limite les requêtes (429). Essaie un proxy résidentiel via YT_PROXY.");
    }
    if (msg.includes('Sign in to confirm')) {
      throw new Error("YouTube demande une connexion. Fournis un fichier de cookies via YT_COOKIES_FILE.");
    }
    if (msg.includes('No module named') || msg.includes('not found')) {
      throw new Error("yt-dlp introuvable côté serveur. Vérifie PYTHON_BIN et l'installation pip.");
    }

    throw new Error("YouTube bloque le téléchargement direct. Ajoute YT_PROXY ou YT_COOKIES_FILE (ou PYTHON_BIN), ou utilise l'option Copier/Coller.");
  }
}

export async function POST(req: Request) {
  try {
    const { url, text: manualText } = await req.json();

    if (!url && !manualText) {
      return NextResponse.json({ error: 'URL ou texte manquant' }, { status: 400 });
    }

    let fullText = manualText || '';
    let videoDescription = '';

    // Si on a une URL mais pas de texte manuel, on passe systématiquement par l'audio
    if (url && !manualText) {
      console.log(`Processing URL: ${url}`);
      const videoId = extractVideoId(url);
      
      if (!videoId) {
        return NextResponse.json({ error: 'URL YouTube invalide' }, { status: 400 });
      }

      const descriptionPromise = getVideoDescription(url, videoId);

      try {
        console.log(`Attempting primary method: Whisper transcription via yt-dlp for ${url}`);
        fullText = await transcribeYoutubeAudio(url);
        console.log(`Whisper transcript success (${fullText.length} chars)`);
      } catch (whisperError: unknown) {
        const whisperMessage = getErrorMessage(whisperError);
        console.error('Audio transcription failed:', whisperMessage);
        return NextResponse.json(
          { error: `Extraction automatique échouée. Audio transcription error: ${whisperMessage}` },
          { status: 422 }
        );
      }

      const description = await descriptionPromise;
      if (description) {
        videoDescription = description;
        console.log(`Video description fetched (${videoDescription.length} chars)`);
      }
    }

    if (!fullText.trim()) {
       return NextResponse.json(
        { error: 'Le contenu texte est vide.' },
        { status: 422 }
      );
    }


    // On réduit la taille pour éviter le "Token Limit" (429) du tier gratuit
    const combinedText = videoDescription
      ? `${fullText}\n\nDescription de la vidéo :\n${videoDescription}`
      : fullText;
    const truncatedText = combinedText.slice(0, 15000);
    console.log(`Sending ${truncatedText.length} chars to Gemini...`);

    // 2. Configuration du Modèle Gemini
    // Utilisation de l'alias stable pour éviter les erreurs de version
      // Utiliser Gemini pour générer le contenu
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
          responseMimeType: "application/json",
      },
    });

    // 3. Préparation du Prompt
    const prompt = `
      Tu es un expert en marketing de contenu.
      Ton but est de reformuler une transcription vidéo en 3 formats distincts.
      
      Voici la transcription enrichie (transcript + description YouTube si disponible) :
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
      } catch (error: unknown) {
        // Si erreur quota ou serveur (429/503), on retry un peu
        const geminiMessage = getErrorMessage(error);
        if ((geminiMessage.includes('429') || geminiMessage.includes('503')) && retryCount < maxRetries - 1) {
          retryCount++;
          const delay = Math.pow(2, retryCount) * 1000 + (Math.random() * 1000);
          console.log(`Quota 429/503 hit. Retrying in ${Math.round(delay)}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // Si c'est le dernier essai ou une autre erreur, on tente le FALLBACK GROQ
          console.warn("Gemini failed, switching to Groq fallback...", geminiMessage);
          try {
             const groqResponse = await generateWithGroq(
                "Tu es un expert en marketing de contenu. Réponds UNIQUEMENT au format JSON.", 
                prompt
             );
             parsedContent = JSON.parse(groqResponse);
             console.log("✅ Groq fallback success");
             break; // Sortir de la boucle de retry Gemini car on a réussi avec Groq
          } catch (groqError: unknown) {
             console.error("❌ Groq fallback failed:", getErrorMessage(groqError));
             throw error; // On renvoie l'erreur originale de Gemini si tout échoue
          }
        }
      }
    }
    
    if (!parsedContent) throw new Error("Échec de la génération (Gemini & Groq)");

    return NextResponse.json(parsedContent);

  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.error('API Error:', error);
    
    let errorMessage = message || 'Erreur interne serveur';
    let status = 500;
    const statusCode = getStatusCode(error);

    if (message.includes('429') || statusCode === 429) {
      errorMessage = 'Quota Google AI dépassé. Veuillez réessayer dans une minute.';
      status = 429;
    } else if (message.includes('503')) {
      errorMessage = 'Service Google AI temporairement indisponible.';
      status = 503;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: status }
    );
  }
}
