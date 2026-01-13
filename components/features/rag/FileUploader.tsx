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
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5" /> Ajouter des documents (PDF)
      </h3>
      
      <div className="flex items-center gap-4">
        <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
          {isUploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {isUploading ? 'Analyse en cours...' : 'Choisir un PDF'}
          <input 
            type="file" 
            accept="application/pdf" 
            className="hidden" 
            onChange={handleFileUpload} 
            disabled={isUploading}
          />
        </label>
        
        {status && (
          <div className={`text-sm flex items-center gap-2 ${
            status.type === 'success' ? 'text-green-600' : 'text-red-600'
          }`}>
            {status.type === 'success' ? <CheckCircle className="w-4 h-4"/> : <AlertCircle className="w-4 h-4"/>}
            {status.message}
          </div>
        )}
      </div>
      <p className="text-xs text-slate-500 mt-2">
        Les documents seront analysés et stockés dans la base de connaissances.
      </p>
    </div>
  );
}
