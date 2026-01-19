'use client';

import { useState } from 'react';
import { Copy, Loader2, FileText, Linkedin, Twitter } from 'lucide-react';

interface GeneratedContent {
  blogPost: string;
  twitterThread: string[];
  linkedinPost: string;
}

export default function RepurposeGenerator() {
  const [url, setUrl] = useState('');
  const [manualText, setManualText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'blog' | 'twitter' | 'linkedin'>('blog');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/repurpose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, text: manualText }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Une erreur est survenue');
      
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // On pourrait ajouter un toast ici
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold mb-4 text-slate-800">Repurpose Vidéo YouTube</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Option 1 : Via URL YouTube</label>
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">OU</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Option 2 : Coller le texte (Si l'URL ne fonctionne pas)</label>
            <div className="text-xs text-slate-500 mb-1">
              Astuce : Sur YouTube, cliquez sur "... Plus" sous la vidéo &gt; "Afficher la transcription" &gt; Copiez tout le texte.
            </div>
            <textarea
              placeholder="Collez ici la transcription de la vidéo..."
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              rows={4}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || (!url && !manualText)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Générer le contenu'}
          </button>
        </form>
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
            {error}
          </div>
        )}
      </div>

      {result && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto">
            <button
              onClick={() => setActiveTab('blog')}
              className={`flex-1 min-w-[120px] py-4 font-medium flex items-center justify-center gap-2 transition-all ${activeTab === 'blog' ? 'bg-white border-t-2 border-blue-600 text-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <FileText className="w-4 h-4" /> Blog
            </button>
            <button
              onClick={() => setActiveTab('twitter')}
              className={`flex-1 min-w-[120px] py-4 font-medium flex items-center justify-center gap-2 transition-all ${activeTab === 'twitter' ? 'bg-white border-t-2 border-blue-600 text-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Twitter className="w-4 h-4" /> Twitter
            </button>
            <button
              onClick={() => setActiveTab('linkedin')}
              className={`flex-1 min-w-[120px] py-4 font-medium flex items-center justify-center gap-2 transition-all ${activeTab === 'linkedin' ? 'bg-white border-t-2 border-blue-600 text-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Linkedin className="w-4 h-4" /> LinkedIn
            </button>
          </div>

          <div className="p-6 relative min-h-[200px]">
            <button
              onClick={() => {
                const textToCopy = activeTab === 'twitter' 
                  ? result.twitterThread.join('\n\n---\n\n') 
                  : activeTab === 'blog' ? result.blogPost : result.linkedinPost;
                copyToClipboard(textToCopy);
              }}
              className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors text-slate-600"
              title="Copier le contenu"
            >
              <Copy className="w-4 h-4" />
            </button>

            {activeTab === 'blog' && (
              <article 
                className="prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-3xl"
                dangerouslySetInnerHTML={{ __html: result.blogPost }}
              />
            )}

            {activeTab === 'twitter' && (
              <div className="space-y-4">
                {result.twitterThread.map((tweet, index) => (
                  <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-100 relative">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                      Tweet {index + 1}/{result.twitterThread.length}
                    </span>
                    <p className="text-slate-800 whitespace-pre-wrap">{tweet}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'linkedin' && (
              <div className="whitespace-pre-wrap text-slate-800 leading-relaxed">
                {result.linkedinPost}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
