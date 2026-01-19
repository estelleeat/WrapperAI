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
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900">Nouveau Projet</h2>
          <p className="text-sm text-slate-500 mt-1">Transformez une vidéo YouTube en contenu écrit optimisé.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1 */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <label className="block text-sm font-semibold text-slate-700 mb-2">URL YouTube</label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://youtube.com/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 p-2.5 bg-white border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-2 text-xs font-medium text-gray-400 uppercase tracking-wider">Ou transcription manuelle</span>
            </div>
          </div>

          {/* Section 2 */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Texte Source</label>
            <textarea
              placeholder="Collez votre transcription ici..."
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              rows={6}
              className="w-full p-3 bg-white border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-mono text-slate-600"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isLoading || (!url && !manualText)}
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-2.5 rounded-md font-medium text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Générer le contenu'}
            </button>
          </div>
        </form>
        
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 border border-red-100 rounded-md text-sm flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
            {error}
          </div>
        )}
      </div>

      {result && (
        <div className="mt-12 border-t border-gray-200 pt-8">
          <div className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-lg w-fit mb-6">
            <button
              onClick={() => setActiveTab('blog')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'blog' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <FileText className="w-4 h-4" /> Blog
            </button>
            <button
              onClick={() => setActiveTab('twitter')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'twitter' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Twitter className="w-4 h-4" /> Twitter
            </button>
            <button
              onClick={() => setActiveTab('linkedin')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'linkedin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Linkedin className="w-4 h-4" /> LinkedIn
            </button>
          </div>

          <div className="relative bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
            <button
              onClick={() => {
                const textToCopy = activeTab === 'twitter' 
                  ? result.twitterThread.join('\n\n---\n\n') 
                  : activeTab === 'blog' ? result.blogPost : result.linkedinPost;
                copyToClipboard(textToCopy);
              }}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-slate-900 hover:bg-gray-50 rounded-md transition-all"
              title="Copier"
            >
              <Copy className="w-4 h-4" />
            </button>

            {activeTab === 'blog' && (
              <article 
                className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-lg"
                dangerouslySetInnerHTML={{ __html: result.blogPost }}
              />
            )}

            {activeTab === 'twitter' && (
              <div className="space-y-4 max-w-2xl">
                {result.twitterThread.map((tweet, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                       <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">{index + 1}</div>
                       {index !== result.twitterThread.length - 1 && <div className="w-0.5 flex-1 bg-slate-100 my-1"></div>}
                    </div>
                    <div className="pb-6">
                      <p className="text-slate-800 whitespace-pre-wrap text-sm leading-relaxed">{tweet}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'linkedin' && (
              <div className="whitespace-pre-wrap text-slate-800 leading-relaxed font-sans text-sm max-w-3xl">
                {result.linkedinPost}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
