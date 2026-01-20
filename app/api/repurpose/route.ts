import { NextResponse } from 'next/server';
import { genAI } from '@/lib/google';
import { generateWithGroq, transcribeAudio } from '@/lib/groq';
import { exec } from 'child_process';
import { promisify } from 'util';
import ytdl from '@distube/ytdl-core';
import { Innertube } from 'youtubei.js';

// Force runtime Node (pas Edge) pour autoriser child_process / yt-dlp
export const runtime = 'nodejs';

const execAsync = promisify(exec);

function extractVideoId(url: string): string | null {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?)|(shorts\/))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && (match[8] || match[7]).length === 11) ? (match[8] || match[7]) : null;
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
  console.log(`Starting Whisper transcription with yt-dlp for: ${url}`);
  
  try {
    const pythonBin = process.env.PYTHON_BIN || 'python3';
    const userAgent =
      process.env.YT_USER_AGENT ||
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
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
    
    const { execSync } = require('child_process');
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

  } catch (error: any) {
    const msg = error?.message || '';
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
