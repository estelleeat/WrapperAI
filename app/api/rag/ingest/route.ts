import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getEmbedding, genAI } from '@/lib/google';
import pdf from 'pdf-parse/lib/pdf-parse.js';

export async function POST(req: Request) {
  try {
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
    let numpages = 1;
    
    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        
        if (file.type === 'application/pdf') {
            const data = await pdf(buffer);
            text = data.text;
            numpages = data.numpages;
        } else if (file.type.startsWith('image/')) {
            // Utilisation de Gemini Vision pour extraire le texte de l'image
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const prompt = "Extrait tout le texte visible dans cette image. Sois précis et exhaustif. Si c'est un graphique, décris-le en détail.";
            
            const imagePart = {
                inlineData: {
                    data: buffer.toString('base64'),
                    mimeType: file.type,
                },
            };

            const result = await model.generateContent([prompt, imagePart]);
            const response = await result.response;
            text = response.text();
            console.log("Texte extrait de l'image :", text.substring(0, 100) + "...");
        } else {
             return NextResponse.json({ error: 'Format de fichier non supporté.' }, { status: 400 });
        }
        
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

    // 2. Chunking (Segments plus grands pour rapidité)
    const chunkSize = 4000;
    const overlap = 400;
    const chunks = [];
    
    for (let i = 0; i < text.length; i += (chunkSize - overlap)) {
      chunks.push(text.slice(i, i + chunkSize));
    }

    console.log(`Traitement de ${chunks.length} segments...`);

    // 3. Génération des embeddings et stockage
    let savedCount = 0;
    
    for (const chunk of chunks) {
      if (chunk.trim().length < 50) continue;

      try {
        const embedding = await getEmbedding(chunk);
        
        const { error } = await supabase.from('documents').insert({
          content: chunk,
          metadata: { filename: file.name, page_count: numpages },
          embedding,
        });

        if (!error) savedCount++;
      } catch (e: any) {
        console.error('Embedding processing error:', e);
        if (e.message?.includes('429')) {
           return NextResponse.json(
             { error: 'Quota API dépassé. Veuillez réessayer dans une minute.' },
             { status: 429 }
           );
        }
      }
    }

    if (savedCount === 0) {
         return NextResponse.json(
            { error: "Erreur lors de l'indexation du document." },
            { status: 500 }
        );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Document analysé et ajouté avec succès" 
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
