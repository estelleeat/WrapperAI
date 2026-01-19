'use client';

import { useState } from 'react';
import { Copy, Loader2, FileText, Linkedin, Twitter, Heart, MessageCircle, Repeat, Share2, ThumbsUp, MoreHorizontal } from 'lucide-react';

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
          <div className="flex justify-between items-center mb-8">
             <div className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-lg">
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
             
             <button
                onClick={() => {
                  const textToCopy = activeTab === 'twitter' 
                    ? result.twitterThread.join('\n\n---\n\n') 
                    : activeTab === 'blog' ? result.blogPost : result.linkedinPost;
                  copyToClipboard(textToCopy);
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              >
                <Copy className="w-4 h-4" /> Copier le texte
              </button>
          </div>

          <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-8 min-h-[400px]">
            
            {/* BLOG VIEW */}
            {activeTab === 'blog' && (
              <div className="max-w-2xl mx-auto bg-white shadow-sm border border-gray-100 rounded-lg p-8 md:p-12">
                <article 
                  className="prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-3xl prose-a:text-blue-600 prose-img:rounded-xl"
                  dangerouslySetInnerHTML={{ __html: result.blogPost }}
                />
              </div>
            )}

            {/* TWITTER VIEW */}
            {activeTab === 'twitter' && (
              <div className="max-w-[500px] mx-auto space-y-0">
                {result.twitterThread.map((tweet, index) => (
                  <div key={index} className="bg-white border border-gray-200 p-4 first:rounded-t-xl last:rounded-b-xl border-b-0 last:border-b hover:bg-gray-50/50 transition-colors relative">
                    {index !== result.twitterThread.length - 1 && (
                        <div className="absolute left-[2.25rem] top-[3.5rem] bottom-[-1rem] w-0.5 bg-gray-200 z-0"></div>
                    )}
                    <div className="flex gap-3 relative z-10">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">U</div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 mb-0.5">
                                <span className="font-bold text-slate-900 text-sm">User Name</span>
                                <span className="text-slate-500 text-sm">@username · 1h</span>
                            </div>
                            <p className="text-slate-900 text-[15px] whitespace-pre-wrap leading-normal mb-3">{tweet}</p>
                            <div className="flex items-center justify-between text-slate-500 max-w-[300px]">
                                <MessageCircle className="w-4 h-4 hover:text-blue-500 cursor-pointer" />
                                <Repeat className="w-4 h-4 hover:text-green-500 cursor-pointer" />
                                <Heart className="w-4 h-4 hover:text-red-500 cursor-pointer" />
                                <Share2 className="w-4 h-4 hover:text-blue-500 cursor-pointer" />
                            </div>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* LINKEDIN VIEW */}
            {activeTab === 'linkedin' && (
              <div className="max-w-[550px] mx-auto bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                 <div className="p-4 flex gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex-shrink-0"></div>
                    <div>
                        <div className="font-semibold text-sm text-slate-900">User Name</div>
                        <div className="text-xs text-slate-500">Expert en création de contenu | IA Enthusiast</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">1h • <span className="w-3 h-3 bg-slate-400 rounded-full flex items-center justify-center text-[8px] text-white">🌐</span></div>
                    </div>
                    <div className="ml-auto text-slate-500"><MoreHorizontal className="w-5 h-5" /></div>
                 </div>
                 
                 <div className="px-4 pb-4">
                    <div className="whitespace-pre-wrap text-slate-800 text-sm leading-relaxed">
                        {result.linkedinPost}
                    </div>
                 </div>

                 <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between text-slate-500">
                    <div className="flex items-center gap-1 text-xs">
                        <ThumbsUp className="w-3 h-3 bg-blue-500 text-white rounded-full p-0.5" />
                        <span>124</span>
                    </div>
                    <div className="text-xs">12 commentaires • 4 partages</div>
                 </div>

                 <div className="px-2 py-1 border-t border-gray-200 flex justify-between">
                    <button className="flex-1 py-3 hover:bg-gray-100 rounded-md flex items-center justify-center gap-2 text-slate-600 font-medium text-sm transition-colors">
                        <ThumbsUp className="w-4 h-4" /> J'aime
                    </button>
                    <button className="flex-1 py-3 hover:bg-gray-100 rounded-md flex items-center justify-center gap-2 text-slate-600 font-medium text-sm transition-colors">
                        <MessageCircle className="w-4 h-4" /> Commenter
                    </button>
                    <button className="flex-1 py-3 hover:bg-gray-100 rounded-md flex items-center justify-center gap-2 text-slate-600 font-medium text-sm transition-colors">
                        <Share2 className="w-4 h-4" /> Partager
                    </button>
                 </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
