'use client';

import { useState } from 'react';
import { signup } from '../login/actions'; // Reuse actions
import { Loader2, AlertCircle, ChevronLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    
    const res = await signup(formData);
    
    if (res?.error) {
        setError(res.error);
        setIsLoading(false);
    } else {
        setSuccess(true);
        setIsLoading(false);
    }
  }

  if (success) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Inscription réussie !</h3>
                    <div className="mt-2">
                        <p className="text-sm text-gray-500">
                            Un email de confirmation a été envoyé à votre adresse. Veuillez cliquer sur le lien pour activer votre compte.
                        </p>
                    </div>
                    <div className="mt-6">
                        <Link href="/login" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:text-sm">
                            Retour à la connexion
                        </Link>
                    </div>
                </div>
            </div>
        </div>
      )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-6 text-slate-400 hover:text-slate-600 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Retour
        </Link>
        <div className="flex justify-center">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-lg">W</div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Créer un compte
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Déjà membre ?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Connectez-vous
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-lg sm:px-10 border border-slate-100">
          <form action={handleSubmit} className="space-y-6">
            
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
                Nom complet
              </label>
              <div className="mt-1">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

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
                  autoComplete="new-password"
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
                            <h3 className="text-sm font-medium text-red-800">Erreur d'inscription</h3>
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
                {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "S'inscrire"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
