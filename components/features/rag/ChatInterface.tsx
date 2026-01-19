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
    <div className="flex flex-col h-full bg-white">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} group`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-medium shadow-sm ${ 
              msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-slate-700'
            }`}>
              {msg.role === 'user' ? 'JS' : <Bot className="w-5 h-5" />}
            </div>
            
            <div className={`max-w-[80%] space-y-2`}>
              <div className={`prose max-w-none text-sm leading-relaxed px-4 py-3 rounded-2xl shadow-sm ${ 
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-gray-50 text-slate-800 border border-gray-100 rounded-tl-none'
              }`}>
                  {msg.role === 'assistant' ? (
                     <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>') }} />
                  ) : (
                    msg.content
                  )}
              </div>
              
              {msg.sources && msg.sources.length > 0 && (
                <div className="flex flex-wrap gap-2 pl-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {msg.sources.map((source, i) => (
                    <span key={i} className="text-[10px] font-medium text-slate-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded cursor-help hover:border-blue-300 transition-colors">
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
      <div className="p-6 bg-white border-t border-gray-100">
        <form onSubmit={sendMessage} className="relative flex items-center shadow-sm">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez une question sur vos documents..."
            className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-1.5 bg-white border border-gray-200 text-slate-400 rounded-md hover:text-blue-600 hover:border-blue-600 disabled:opacity-50 disabled:hover:text-slate-400 disabled:hover:border-gray-200 transition-all shadow-sm"
          >
            {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
        <div className="mt-2 text-center">
            <span className="text-[10px] text-slate-400">Assistant alimenté par RAG • Confidentialité Enterprise</span>
        </div>
      </div>
    </div>
  );
}
