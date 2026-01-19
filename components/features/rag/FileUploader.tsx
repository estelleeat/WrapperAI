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
    <div className="border-b border-slate-200 pb-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Base de connaissances</h3>
        <span className="text-xs text-slate-500">PDF uniquement</span>
      </div>
      
      <div className="flex flex-col gap-3">
        <label className={`cursor-pointer border border-dashed border-slate-300 hover:border-slate-800 hover:bg-slate-50 px-4 py-8 rounded-md transition-all flex flex-col items-center justify-center gap-2 text-center group ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {isUploading ? (
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          ) : (
            <Upload className="w-6 h-6 text-slate-400 group-hover:text-slate-800 transition-colors" />
          )}
          <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">
            {isUploading ? 'Analyse en cours...' : 'Déposer un PDF ou cliquer'}
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
          <div className={`text-xs px-3 py-2 rounded-md flex items-center gap-2 ${
            status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {status.type === 'success' ? <CheckCircle className="w-3 h-3"/> : <AlertCircle className="w-3 h-3"/>}
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
}
