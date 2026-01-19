'use client';

import { useState } from 'react';
import { login } from './actions';
import { Loader2, AlertCircle, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    
    const res = await login(formData);
    
    if (res?.error) {
        setError(res.error);
        setIsLoading(false);
    }
    // Si succès, la redirection est gérée par l'action serveur
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-6 text-slate-400 hover:text-slate-600 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Retour
        </Link>
        <div className="flex justify-center">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">W</div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Connexion à votre espace
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Ou{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            créez un compte gratuitement
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-lg sm:px-10 border border-slate-100">
          <form action={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Adresse email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Mot de passe
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {error && (
                <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Erreur de connexion</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Se connecter'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
