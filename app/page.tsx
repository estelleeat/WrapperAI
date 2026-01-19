'use client';

import { useState } from 'react';
import { Bot, Youtube, Menu, Settings, X } from 'lucide-react';
import RepurposeGenerator from '@/components/features/repurpose/RepurposeGenerator';
import FileUploader from '@/components/features/rag/FileUploader';
import ChatInterface from '@/components/features/rag/ChatInterface';

export default function WorkspacePage() {
  const [activeTab, setActiveTab] = useState<'repurpose' | 'rag'>('repurpose');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-black font-sans text-zinc-100 selection:bg-white selection:text-black">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-black border-r border-zinc-800 transition-all duration-300 overflow-hidden flex flex-col`}>
        <div className="p-6 border-b border-zinc-800 mb-2 flex items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight flex items-center gap-2 text-white">
            <div className="w-5 h-5 bg-white rounded-sm"></div>
            WrapperAI
          </h1>
        </div>
        
        <nav className="flex-1 px-3 space-y-1 py-4">
          <div className="px-3 mb-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Outils</div>
          <button
            onClick={() => setActiveTab('repurpose')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'repurpose' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
          >
            <Youtube className="w-4 h-4" />
            Studio Vidéo
          </button>
          
          <button
            onClick={() => setActiveTab('rag')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'rag' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
          >
            <Bot className="w-4 h-4" />
            Assistant RAG
          </button>
        </nav>

        {activeTab === 'rag' && (
          <div className="p-4 border-t border-zinc-800 bg-zinc-900/30">
             <FileUploader />
          </div>
        )}
        
        <div className="p-4 border-t border-zinc-800 text-xs text-zinc-500 flex items-center gap-2 font-mono">
            <Settings className="w-3 h-3" /> v1.0.0 Pro
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-black">
        <header className="h-14 border-b border-zinc-800 flex items-center px-6 justify-between bg-black shrink-0 z-10">
           <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-zinc-400 hover:text-white rounded-md transition-colors">
               {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
             </button>
             <span className="text-sm font-medium text-zinc-400">
               {activeTab === 'repurpose' ? '/ studio-creation' : '/ assistant-documentaire'}
             </span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-300">
                ME
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-black">
          {activeTab === 'repurpose' && (
            <div className="max-w-4xl mx-auto p-8 animate-in fade-in zoom-in-95 duration-300">
               <RepurposeGenerator />
            </div>
          )}

          {activeTab === 'rag' && (
             <div className="h-full flex flex-col animate-in fade-in zoom-in-95 duration-300">
               <ChatInterface />
             </div>
          )}
        </div>
      </main>
    </div>
  );
}
