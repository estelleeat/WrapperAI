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
    <div className="max-w-5xl mx-auto space-y-10 text-zinc-300">
      <div>
        <h2 className="text-xl font-bold mb-8 text-white tracking-tight">Studio de Création</h2>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Source Vidéo</label>
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-sm text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-white focus:border-white focus:outline-none transition-all"
            />
          </div>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-zinc-800"></div>
            <span className="flex-shrink-0 mx-4 text-zinc-600 text-[10px] font-mono uppercase">OR MANUAL INPUT</span>
            <div className="flex-grow border-t border-zinc-800"></div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Transcription</label>
            <textarea
              placeholder="Collez le texte brut ici..."
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              rows={6}
              className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-sm text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-white focus:border-white focus:outline-none transition-all font-mono text-xs leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || (!url && !manualText)}
            className="w-full bg-white hover:bg-zinc-200 text-black px-6 py-4 rounded-sm font-bold text-sm tracking-wide transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase"
          >
            {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Lancer la génération'}
          </button>
        </form>
        
        {error && (
          <div className="mt-6 p-4 bg-red-950/30 text-red-400 border border-red-900/50 text-sm font-mono">
            Error: {error}
          </div>
        )}
      </div>

      {result && (
        <div className="border-t border-zinc-800 pt-10">
          <div className="flex border-b border-zinc-800 mb-8">
            <button
              onClick={() => setActiveTab('blog')}
              className={`px-6 py-4 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all border-b-2 ${activeTab === 'blog' ? 'border-white text-white' : 'border-transparent text-zinc-600 hover:text-zinc-300'}`}
            >
              <FileText className="w-4 h-4" /> Article
            </button>
            <button
              onClick={() => setActiveTab('twitter')}
              className={`px-6 py-4 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all border-b-2 ${activeTab === 'twitter' ? 'border-white text-white' : 'border-transparent text-zinc-600 hover:text-zinc-300'}`}
            >
              <Twitter className="w-4 h-4" /> Thread
            </button>
            <button
              onClick={() => setActiveTab('linkedin')}
              className={`px-6 py-4 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all border-b-2 ${activeTab === 'linkedin' ? 'border-white text-white' : 'border-transparent text-zinc-600 hover:text-zinc-300'}`}
            >
              <Linkedin className="w-4 h-4" /> LinkedIn
            </button>
          </div>

          <div className="relative min-h-[200px] bg-zinc-900/20 p-6 border border-zinc-800 rounded-sm">
            <button
              onClick={() => {
                const textToCopy = activeTab === 'twitter' 
                  ? result.twitterThread.join('\n\n---\n\n') 
                  : activeTab === 'blog' ? result.blogPost : result.linkedinPost;
                copyToClipboard(textToCopy);
              }}
              className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors"
              title="Copy to clipboard"
            >
              <Copy className="w-4 h-4" />
            </button>

            {activeTab === 'blog' && (
              <article 
                className="prose prose-invert max-w-none prose-headings:font-bold prose-h1:text-2xl prose-a:text-white prose-a:underline hover:prose-a:text-zinc-300"
                dangerouslySetInnerHTML={{ __html: result.blogPost }}
              />
            )}

            {activeTab === 'twitter' && (
              <div className="space-y-6">
                {result.twitterThread.map((tweet, index) => (
                  <div key={index} className="pl-4 border-l-2 border-zinc-700 py-1">
                    <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">{tweet}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'linkedin' && (
              <div className="whitespace-pre-wrap text-zinc-300 leading-relaxed font-sans">
                {result.linkedinPost}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
