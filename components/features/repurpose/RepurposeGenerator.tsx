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
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-6 text-slate-900">Générateur de contenu à partir de vidéo</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Source : URL YouTube</label>
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-3 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent focus:outline-none transition-all"
            />
          </div>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase tracking-wider">OU Texte Manuel</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Source : Transcription manuelle</label>
            <textarea
              placeholder="Collez ici le texte..."
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              rows={6}
              className="w-full p-3 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent focus:outline-none transition-all font-mono text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || (!url && !manualText)}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-md font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Générer le contenu'}
          </button>
        </form>
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-100 text-sm">
            {error}
          </div>
        )}
      </div>

      {result && (
        <div className="border-t border-slate-200 pt-8">
          <div className="flex border-b border-slate-200 mb-6">
            <button
              onClick={() => setActiveTab('blog')}
              className={`px-6 py-3 font-medium text-sm flex items-center gap-2 transition-all border-b-2 ${activeTab === 'blog' ? 'border-black text-black' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              <FileText className="w-4 h-4" /> Article de Blog
            </button>
            <button
              onClick={() => setActiveTab('twitter')}
              className={`px-6 py-3 font-medium text-sm flex items-center gap-2 transition-all border-b-2 ${activeTab === 'twitter' ? 'border-black text-black' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              <Twitter className="w-4 h-4" /> Thread Twitter
            </button>
            <button
              onClick={() => setActiveTab('linkedin')}
              className={`px-6 py-3 font-medium text-sm flex items-center gap-2 transition-all border-b-2 ${activeTab === 'linkedin' ? 'border-black text-black' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              <Linkedin className="w-4 h-4" /> Post LinkedIn
            </button>
          </div>

          <div className="relative min-h-[200px]">
            <button
              onClick={() => {
                const textToCopy = activeTab === 'twitter' 
                  ? result.twitterThread.join('\n\n---\n\n') 
                  : activeTab === 'blog' ? result.blogPost : result.linkedinPost;
                copyToClipboard(textToCopy);
              }}
              className="absolute top-0 right-0 p-2 text-slate-400 hover:text-slate-900 transition-colors"
              title="Copier"
            >
              <Copy className="w-5 h-5" />
            </button>

            {activeTab === 'blog' && (
              <article 
                className="prose prose-slate max-w-none prose-headings:font-semibold prose-h1:text-2xl prose-a:text-blue-600"
                dangerouslySetInnerHTML={{ __html: result.blogPost }}
              />
            )}

            {activeTab === 'twitter' && (
              <div className="space-y-6">
                {result.twitterThread.map((tweet, index) => (
                  <div key={index} className="pl-4 border-l-2 border-slate-200 py-1">
                    <p className="text-slate-800 whitespace-pre-wrap">{tweet}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'linkedin' && (
              <div className="whitespace-pre-wrap text-slate-800 leading-relaxed font-sans">
                {result.linkedinPost}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
