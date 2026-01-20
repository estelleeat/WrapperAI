'use client';

import { useState } from 'react';
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function FileUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setStatus({ type: 'error', message: 'Formats acceptés : PDF, PNG, JPG.' });
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
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Base de Connaissances</h3>
        <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">PDF / IMG</span>
      </div>
      
      <div className="flex flex-col gap-3">
        <label className={`cursor-pointer border border-dashed border-slate-300 hover:border-slate-500 hover:bg-slate-50 px-4 py-8 rounded-md transition-all flex flex-col items-center justify-center gap-2 text-center group ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {isUploading ? (
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          ) : (
            <Upload className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          )}
          <span className="text-xs font-medium text-slate-500 group-hover:text-slate-700">
            {isUploading ? 'Traitement...' : 'Ajouter un document'}
          </span>
          <input 
            type="file" 
            accept="application/pdf, image/png, image/jpeg, image/jpg" 
            className="hidden" 
            onChange={handleFileUpload} 
            disabled={isUploading}
          />
        </label>
        
        {status && (
          <div className={`text-[10px] px-3 py-2 rounded-md flex items-center gap-2 font-medium ${
            status.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
          }`}>
            {status.type === 'success' ? <CheckCircle className="w-3 h-3"/> : <AlertCircle className="w-3 h-3"/>}
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
}
