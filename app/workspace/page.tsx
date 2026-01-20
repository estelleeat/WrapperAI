'use client';

import { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, Bot, Youtube, Menu, Settings, ChevronRight, Search, Bell, LogOut, User, MessageSquare, Box } from 'lucide-react';
import { signout } from '../login/actions';
import { createClient } from '@/utils/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import RepurposeGenerator from '@/components/features/repurpose/RepurposeGenerator';
import FileUploader from '@/components/features/rag/FileUploader';
import ChatInterface from '@/components/features/rag/ChatInterface';
import ToolsInterface from '@/components/features/rag/ToolsInterface';

export default function WorkspacePage() {
  const [activeTab, setActiveTab] = useState<'repurpose' | 'rag' | 'tools'>('repurpose');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [systemStatus, setSystemStatus] = useState<'operational' | 'down'>('operational');

  useEffect(() => {
    const supabase = createClient();
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // Check system health
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) setSystemStatus('operational');
        else setSystemStatus('down');
      } catch {
        setSystemStatus('down');
      }
    };
    
    checkHealth();
    // Poll every minute
    const interval = setInterval(checkHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  // Dérivation des initiales et du nom
  const fullName = user?.user_metadata?.full_name || 'Utilisateur';
  const email = user?.email || '';
  const initials = fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-900">
      {/* Professional Sidebar - Dark Slate */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-slate-900 border-r border-slate-800 transition-all duration-300 overflow-hidden flex flex-col shrink-0 text-slate-300`}>
        <div className="h-14 flex items-center px-4 border-b border-slate-800">
          <div className="flex items-center gap-2 font-semibold text-white tracking-tight">
            <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center text-[10px]">W</div>
            WrapperAI
          </div>
        </div>
        
        <nav className="flex-1 px-2 py-6 space-y-1">
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Apps</div>
          
          <button
            onClick={() => setActiveTab('repurpose')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${activeTab === 'repurpose' ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <Youtube className="w-4 h-4 opacity-80" />
            Studio Vidéo
          </button>
          
          <button
            onClick={() => setActiveTab('rag')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${activeTab === 'rag' ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <Bot className="w-4 h-4 opacity-80" />
            Assistant RAG
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${activeTab === 'tools' ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <Box className="w-4 h-4 opacity-80" />
            Micro-Apps
          </button>
        </nav>

        {activeTab === 'rag' && (
          <div className="p-4 border-t border-slate-800 bg-slate-900">
             <FileUploader />
          </div>
        )}
        
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${systemStatus === 'operational' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></div>
                {systemStatus === 'operational' ? 'System Operational' : 'AI Service Offline'}
            </div>
            <Settings className="w-3 h-3 hover:text-white cursor-pointer" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header - Light & Minimal */}
        <header className="h-14 border-b border-gray-200 bg-white flex items-center px-6 justify-between shrink-0 z-20 relative">
           <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 text-slate-500 hover:bg-gray-100 rounded-md transition-colors">
               <Menu className="w-5 h-5" />
             </button>
             <nav className="flex items-center text-sm text-slate-500">
               <span className="hover:text-slate-900 cursor-pointer">Dashboard</span>
               <ChevronRight className="w-4 h-4 mx-1 text-slate-400" />
               <span className="font-medium text-slate-900">
                 {activeTab === 'repurpose' ? 'Création de Contenu' : activeTab === 'rag' ? 'Base de Connaissances' : 'Mes Micro-Apps'}
               </span>
             </nav>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                  <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
                  <input type="text" placeholder="Rechercher..." className="pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64" />
              </div>
              <button className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              
              <div className="relative">
                <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-white cursor-pointer hover:ring-blue-100 transition-all"
                >
                    {initials}
                </button>

                {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-100 py-1 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-4 py-2 border-b border-gray-50 mb-1">
                            <p className="text-sm font-medium text-slate-900 truncate">{fullName}</p>
                            <p className="text-xs text-slate-500 truncate">{email}</p>
                        </div>
                        <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-gray-50 flex items-center gap-2">
                            <User className="w-4 h-4" /> Profil
                        </button>
                        <button 
                            onClick={() => signout()}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" /> Déconnexion
                        </button>
                    </div>
                )}
              </div>
           </div>
        </header>

        {/* Workspace */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-8">
          <div className="max-w-6xl mx-auto h-full flex flex-col">
            
            {activeTab === 'repurpose' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[500px] animate-in fade-in slide-in-from-bottom-2 duration-500">
                 <RepurposeGenerator />
              </div>
            )}

            {activeTab === 'rag' && (
               <div className="flex-1 flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
                        <div className="lg:col-span-1 space-y-6 overflow-y-auto">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <FileUploader />
                                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                                    <p className="text-[10px] text-blue-700 leading-relaxed">
                                        <strong>Note :</strong> Les documents ajoutés ici alimentent uniquement l'Assistant RAG pour vos recherches techniques.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-3 flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <ChatInterface />
                        </div>
                    </div>
               </div>
            )}

            {activeTab === 'tools' && (
              <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <ToolsInterface />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
