import FileUploader from '@/components/features/rag/FileUploader';
import ChatInterface from '@/components/features/rag/ChatInterface';
import Link from 'next/link';
import { Bot, Youtube } from 'lucide-react';

export default function AssistantPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
            WrapperAI
          </h1>
          <div className="flex justify-center gap-4 mb-8">
            <Link 
              href="/" 
              className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 hover:border-blue-600 hover:text-blue-600 rounded-xl font-semibold shadow-sm transition-all"
            >
              <Youtube className="w-5 h-5" /> Repurpose Vidéo
            </Link>
            <Link 
              href="/assistant" 
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-xl font-semibold shadow-sm"
            >
              <Bot className="w-5 h-5" /> Assistant RAG
            </Link>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Assistant Appels d'Offres (RAG)
          </h1>
          <p className="text-slate-600">
            Posez des questions techniques ou générez des réponses basées sur vos anciens dossiers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar Upload */}
          <div className="lg:col-span-1 space-y-6">
            <FileUploader />
          </div>

          {/* Chat Zone */}
          <div className="lg:col-span-2">
            <ChatInterface />
          </div>
        </div>
      </div>
    </main>
  );
}
