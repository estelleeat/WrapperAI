'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Bonjour ! Je suis votre assistant expert en appels d\'offres. Posez-moi une question sur vos documents.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/rag/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      // On déduplique les sources
      const uniqueSources = Array.from(new Set(data.sources as string[]));

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.answer,
        sources: uniqueSources
      }]);

    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Désolé, une erreur est survenue lors de la recherche." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full max-w-4xl mx-auto">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0 ${ 
              msg.role === 'user' ? 'bg-black text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            
            <div className={`max-w-[85%] space-y-3`}>
              <div className={`prose prose-slate max-w-none ${ 
                msg.role === 'user' 
                  ? 'bg-slate-100 p-3 rounded-lg text-slate-900' 
                  : 'text-slate-800'
              }`}>
                  {msg.role === 'assistant' ? (
                     <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>') }} />
                  ) : (
                    msg.content
                  )}
              </div>
              
              {msg.sources && msg.sources.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {msg.sources.map((source, i) => (
                    <span key={i} className="text-[10px] uppercase tracking-wide font-medium bg-slate-100 border border-slate-200 px-2 py-1 rounded-md text-slate-500">
                      {source}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/80 backdrop-blur-sm sticky bottom-0">
        <form onSubmit={sendMessage} className="relative max-w-4xl mx-auto flex items-center border border-slate-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-black focus-within:border-transparent transition-all bg-white">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez une question sur vos appels d'offres..."
            className="flex-1 p-4 bg-transparent border-none focus:ring-0 outline-none text-slate-900 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2 mr-2 text-slate-400 hover:text-slate-900 disabled:opacity-30 transition-colors"
          >
            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
        <p className="text-center text-xs text-slate-400 mt-2">L'IA peut faire des erreurs. Vérifiez toujours les informations importantes.</p>
      </div>
    </div>
  );
}
