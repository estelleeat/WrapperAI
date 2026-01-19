import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getEmbedding } from '@/lib/google';
import pdf from 'pdf-parse/lib/pdf-parse.js';

export async function POST(req: Request) {
  try {
    const pdf = require('pdf-parse');
    const formData = await req.formData();
    const file = formData.get('file') as File;

    // Check Supabase config
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
       return NextResponse.json({ error: 'Configuration Supabase manquante (.env.local)' }, { status: 500 });
    }

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // 1. Extraction du texte
    let text = '';
    let numpages = 0;
    
    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const data = await pdf(buffer);
        text = data.text;
        numpages = data.numpages;
        
        if (!text || text.trim().length === 0) {
            return NextResponse.json(
                { error: "Le fichier PDF ne contient pas de texte extractible. Il s'agit peut-être d'un document scanné (image)." },
                { status: 422 }
            );
        }
    } catch (pdfError: any) {
        console.error('PDF Parse Error:', pdfError);
        return NextResponse.json(
            { error: `Impossible de lire le fichier PDF : ${pdfError.message}` },
            { status: 422 }
        );
    }

    // 2. Chunking (Découpage simpliste pour le MVP)
    // On coupe tous les 1000 caractères avec un overlap de 200
    const chunkSize = 1000;
    const overlap = 200;
    const chunks = [];
    
    for (let i = 0; i < text.length; i += (chunkSize - overlap)) {
      chunks.push(text.slice(i, i + chunkSize));
    }

    console.log(`Traitement de ${chunks.length} chunks...`);

    // 3. Génération des embeddings et stockage
    // On le fait en séquentiel pour éviter le rate limit de l'API Google
    let savedCount = 0;
    
    for (const chunk of chunks) {
      if (chunk.trim().length < 50) continue; // Ignorer les chunks trop petits

      try {
        // Petit délai pour éviter le 429 (Rate Limit)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const embedding = await getEmbedding(chunk);
        
        const { error } = await supabase.from('documents').insert({
          content: chunk,
          metadata: { filename: file.name, page_count: numpages },
          embedding,
        });

        if (error) {
          console.error('Supabase error:', error);
          // Si l'erreur vient de la base de données (ex: contrainte), on pourrait vouloir arrêter
        } else {
          savedCount++;
        }
      } catch (e: any) {
        console.error('Embedding processing error:', e);
        if (e.message?.includes('429')) {
           return NextResponse.json(
             { error: 'Quota API dépassé pendant le traitement. Veuillez réessayer plus tard.' },
             { status: 429 }
           );
        }
        // On continue même s'il y a une erreur sur un chunk (sauf si c'est critique comme 429)
      }
    }

    if (savedCount === 0) {
         return NextResponse.json(
            { error: "Aucun segment n'a pu être sauvegardé (problème base de données ou API)." },
            { status: 500 }
        );
    }

    return NextResponse.json({ 
      success: true, 
      message: `${savedCount} segments indexés avec succès` 
    });

  } catch (error: any) {
    console.error('Ingest Error Details:', error);
    console.error('Stack trace:', error.stack);

    if (error.message?.includes('Invalid API key') || error.code === 'PGRST301') {
      return NextResponse.json({ error: 'Clé API Supabase invalide ou expirée.' }, { status: 401 });
    }

    return NextResponse.json(
      { error: error.message || 'Erreur interne serveur' },
      { status: 500 }
    );
  }
}
