import RepurposeGenerator from '@/components/features/repurpose/RepurposeGenerator';
import Link from 'next/link';
import { Bot, Youtube } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
            WrapperAI
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            La plateforme tout-en-un pour booster votre productivité avec l'IA.
          </p>

          <div className="flex justify-center gap-4 mb-12">
            <Link 
              href="/" 
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-xl font-semibold shadow-sm"
            >
              <Youtube className="w-5 h-5" /> Repurpose Vidéo
            </Link>
            <Link 
              href="/assistant" 
              className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 hover:border-blue-600 hover:text-blue-600 rounded-xl font-semibold shadow-sm transition-all"
            >
              <Bot className="w-5 h-5" /> Assistant RAG
            </Link>
          </div>
        </div>
        
        <RepurposeGenerator />
      </div>
    </main>
  );
}
