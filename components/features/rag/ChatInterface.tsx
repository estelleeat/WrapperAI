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
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${ 
              msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
            }`}>
              {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            
            <div className={`max-w-[80%] space-y-2`}>
              <div className={`p-3 rounded-lg shadow-sm ${ 
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
              }`}>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {/* Note: Pour la sécurité, éviter dangerouslySetInnerHTML avec l'input utilisateur en prod */}
                  {msg.role === 'assistant' ? (
                     <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>') }} />
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
              
              {msg.sources && msg.sources.length > 0 && (
                <div className="text-xs text-slate-500 flex gap-2 flex-wrap">
                  Sources : 
                  {msg.sources.map((source, i) => (
                    <span key={i} className="bg-slate-200 px-2 py-1 rounded text-slate-600">
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
      <form onSubmit={sendMessage} className="p-4 bg-white border-t border-slate-200 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Posez une question sur vos documents..."
          className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
}
