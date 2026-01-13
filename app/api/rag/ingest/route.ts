import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getEmbedding } from '@/lib/google';
import pdf from 'pdf-parse';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // 1. Extraction du texte
    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await pdf(buffer);
    const text = data.text;

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
        const embedding = await getEmbedding(chunk);
        
        const { error } = await supabase.from('documents').insert({
          content: chunk,
          metadata: { filename: file.name, page_count: data.numpages },
          embedding,
        });

        if (error) {
          console.error('Supabase error:', error);
        } else {
          savedCount++;
        }
      } catch (e) {
        console.error('Embedding error for chunk:', e);
        // On continue même s'il y a une erreur sur un chunk
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `${savedCount} segments indexés avec succès` 
    });

  } catch (error: any) {
    console.error('Ingest Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur interne serveur' },
      { status: 500 }
    );
  }
}
