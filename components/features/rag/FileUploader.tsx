'use client';

import { useState } from 'react';
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function FileUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setStatus({ type: 'error', message: 'Seuls les fichiers PDF sont acceptés.' });
      return;
    }

    setIsUploading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/rag/ingest', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erreur lors de l'upload");

      setStatus({ type: 'success', message: data.message });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="border-b border-zinc-800 pb-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Base de connaissances</h3>
        <span className="text-[10px] text-zinc-600 font-mono">PDF ONLY</span>
      </div>
      
      <div className="flex flex-col gap-3">
        <label className={`cursor-pointer border border-dashed border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900/50 px-4 py-8 rounded-sm transition-all flex flex-col items-center justify-center gap-2 text-center group ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {isUploading ? (
            <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
          ) : (
            <Upload className="w-5 h-5 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
          )}
          <span className="text-xs font-medium text-zinc-500 group-hover:text-zinc-300">
            {isUploading ? 'INDEXATION EN COURS...' : 'DRAG & DROP PDF'}
          </span>
          <input 
            type="file" 
            accept="application/pdf" 
            className="hidden" 
            onChange={handleFileUpload} 
            disabled={isUploading}
          />
        </label>
        
        {status && (
          <div className={`text-[10px] px-3 py-2 rounded-sm border flex items-center gap-2 font-mono ${
            status.type === 'success' ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-red-950/20 border-red-900/50 text-red-400'
          }`}>
            {status.type === 'success' ? <CheckCircle className="w-3 h-3"/> : <AlertCircle className="w-3 h-3"/>}
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
}
