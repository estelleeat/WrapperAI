'use client';

import { useState } from 'react';
import { LayoutDashboard, FileText, Bot, Youtube, Menu, Settings } from 'lucide-react';
import RepurposeGenerator from '@/components/features/repurpose/RepurposeGenerator';
import FileUploader from '@/components/features/rag/FileUploader';
import ChatInterface from '@/components/features/rag/ChatInterface';

export default function WorkspacePage() {
  const [activeTab, setActiveTab] = useState<'repurpose' | 'rag'>('repurpose');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-white font-sans text-slate-900">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-slate-50 border-r border-slate-200 transition-all duration-300 overflow-hidden flex flex-col`}>
        <div className="p-6 border-b border-slate-100 mb-2">
          <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-900 rounded-sm"></div>
            WrapperAI
          </h1>
        </div>
        
        <nav className="flex-1 px-3 space-y-1 py-4">
          <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Outils</div>
          <button
            onClick={() => setActiveTab('repurpose')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'repurpose' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
          >
            <Youtube className="w-4 h-4" />
            Repurpose Vidéo
          </button>
          
          <button
            onClick={() => setActiveTab('rag')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'rag' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
          >
            <Bot className="w-4 h-4" />
            Assistant RAG
          </button>
        </nav>

        {activeTab === 'rag' && (
          <div className="p-4 border-t border-slate-200 bg-white/50">
             <FileUploader />
          </div>
        )}
        
        <div className="p-4 border-t border-slate-200 text-xs text-slate-400 flex items-center gap-2">
            <Settings className="w-3 h-3" /> v1.0.0 Pro
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-white">
        <header className="h-14 border-b border-slate-100 flex items-center px-6 justify-between bg-white shrink-0 z-10">
           <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors">
               <Menu className="w-5 h-5" />
             </button>
             <span className="text-sm font-medium text-slate-900">
               {activeTab === 'repurpose' ? 'Studio de Création' : 'Assistant Documentaire'}
             </span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                ME
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'repurpose' && (
            <div className="max-w-4xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
               <RepurposeGenerator />
            </div>
          )}

          {activeTab === 'rag' && (
             <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500">
               <ChatInterface />
             </div>
          )}
        </div>
      </main>
    </div>
  );
}