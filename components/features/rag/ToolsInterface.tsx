'use client';

import { useState } from 'react';
import { Plus, Play, Trash2, Loader2, Sparkles, Box, ArrowRight } from 'lucide-react';

interface ToolConfig {
  id: string;
  name: string;
  description: string;
  inputs: {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'select';
    options?: string[];
  }[];
  promptTemplate: string;
}

export default function ToolsInterface() {
  const [tools, setTools] = useState<ToolConfig[]>([]);
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  
  // State pour la création
  const [newToolPrompt, setNewToolPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  // State pour l'exécution
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [toolResult, setToolResult] = useState('');
  const [toolSources, setToolSources] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const generateTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newToolPrompt.trim()) return;

    setIsGenerating(true);
    setGenError(null);
    try {
      const res = await fetch('/api/tools/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: newToolPrompt }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de la génération");

      const newTool = { ...data, id: Date.now().toString() };
      setTools(prev => [...prev, newTool]);
      setActiveToolId(newTool.id);
      setNewToolPrompt('');
    } catch (err: any) {
      setGenError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const runTool = async (e: React.FormEvent) => {
    e.preventDefault();
    const tool = tools.find(t => t.id === activeToolId);
    if (!tool) return;

    setIsRunning(true);
    setToolResult('');
    setToolSources([]);
    
    try {
      const res = await fetch('/api/tools/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            promptTemplate: tool.promptTemplate,
            inputs: formValues 
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setToolResult(data.result);
      setToolSources(Array.from(new Set(data.sources || [])));
    } catch (err: any) {
      setToolResult(`Erreur : ${err.message || "Une erreur est survenue lors de l'exécution."}`);
    } finally {
      setIsRunning(false);
    }
  };

  const activeTool = tools.find(t => t.id === activeToolId);

  return (
    <div className="flex h-full bg-white">
      {/* Sidebar Liste des Outils */}
      <div className="w-64 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-200">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Mes Micro-Apps</h3>
            <button 
                onClick={() => setActiveToolId(null)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
            >
                <Plus className="w-4 h-4" /> Nouvel Outil
            </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {tools.map(tool => (
                <button
                    key={tool.id}
                    onClick={() => { setActiveToolId(tool.id); setToolResult(''); setFormValues({}); }}
                    className={`w-full text-left px-3 py-3 rounded-md text-sm transition-all flex items-center gap-3 ${activeToolId === tool.id ? 'bg-white shadow-sm border border-gray-200 text-blue-600 font-medium' : 'text-slate-600 hover:bg-gray-100 hover:text-slate-900'}`}
                >
                    <Box className="w-4 h-4 shrink-0" />
                    <span className="truncate">{tool.name}</span>
                </button>
            ))}
            {tools.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400 italic">
                    Aucun outil créé.
                </div>
            )}
        </div>
      </div>

      {/* Zone Principale */}
      <div className="flex-1 overflow-y-auto p-8">
        {!activeTool ? (
            // CRÉATION
            <div className="max-w-2xl mx-auto mt-10">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-6">
                        <Sparkles className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Imaginez un outil, l'IA le crée.</h2>
                    <p className="text-slate-500">Décrivez simplement ce dont vous avez besoin pour automatiser une tâche répétitive.</p>
                </div>

                <form onSubmit={generateTool} className="bg-white p-2 border border-gray-200 rounded-xl shadow-lg shadow-slate-200/50 flex gap-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                    <input 
                        type="text" 
                        value={newToolPrompt}
                        onChange={(e) => setNewToolPrompt(e.target.value)}
                        placeholder="Ex: Générateur d'objets d'email, Calculateur de ROI, Résumeur de texte..."
                        className="flex-1 px-4 py-3 outline-none text-slate-900 placeholder:text-slate-400"
                    />
                    <button 
                        type="submit" 
                        disabled={!newToolPrompt.trim() || isGenerating}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                    </button>
                </form>

                {genError && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                        <Sparkles className="w-4 h-4 opacity-50" />
                        {genError}
                    </div>
                )}

                <div className="mt-8 grid grid-cols-2 gap-4">
                    {["Générateur de slogans", "Traducteur de code Python", "Correcteur d'orthographe pro", "Générateur de FAQ"].map(idea => (
                        <button key={idea} onClick={() => setNewToolPrompt(idea)} className="p-3 text-sm text-slate-600 bg-gray-50 hover:bg-gray-100 rounded-lg text-left border border-transparent hover:border-gray-200 transition-all">
                            ✨ {idea}
                        </button>
                    ))}
                </div>
            </div>
        ) : (
            // EXÉCUTION
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{activeTool.name}</h2>
                        <p className="text-slate-500 mt-1">{activeTool.description}</p>
                    </div>
                    <button 
                        onClick={() => {
                            setTools(tools.filter(t => t.id !== activeTool.id));
                            setActiveToolId(null);
                        }}
                        className="text-red-400 hover:text-red-600 p-2 rounded-md hover:bg-red-50 transition-colors"
                        title="Supprimer l'outil"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Formulaire */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 h-fit">
                        <form onSubmit={runTool} className="space-y-5">
                            {activeTool.inputs.map(input => (
                                <div key={input.key}>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">{input.label}</label>
                                    {input.type === 'textarea' ? (
                                        <textarea
                                            className="w-full p-3 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                                            rows={4}
                                            value={formValues[input.key] || ''}
                                            onChange={e => setFormValues({...formValues, [input.key]: e.target.value})}
                                        />
                                    ) : input.type === 'select' ? (
                                        <select
                                            className="w-full p-3 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                                            value={formValues[input.key] || ''}
                                            onChange={e => setFormValues({...formValues, [input.key]: e.target.value})}
                                        >
                                            <option value="">Sélectionner...</option>
                                            {input.options?.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            className="w-full p-3 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                                            value={formValues[input.key] || ''}
                                            onChange={e => setFormValues({...formValues, [input.key]: e.target.value})}
                                        />
                                    )}
                                </div>
                            ))}
                            <button
                                type="submit"
                                disabled={isRunning}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isRunning ? <Loader2 className="animate-spin w-4 h-4" /> : <><Play className="w-4 h-4" /> Exécuter</>}
                            </button>
                        </form>
                    </div>

                    {/* Résultat */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 min-h-[300px]">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Résultat</h3>
                        {toolResult ? (
                            <div className="space-y-4">
                                <div className="prose prose-sm prose-slate max-w-none">
                                    <div className="whitespace-pre-wrap">{toolResult}</div>
                                </div>
                                {toolSources.length > 0 && (
                                    <div className="pt-4 border-t border-slate-100">
                                        <p className="text-[10px] font-semibold text-slate-500 mb-2 uppercase">Sources documentaires utilisées :</p>
                                        <div className="flex flex-wrap gap-2">
                                            {toolSources.map((source, i) => (
                                                <span key={i} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100 flex items-center gap-1">
                                                    📄 {source}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-300 italic text-sm">
                                Le résultat apparaîtra ici...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
