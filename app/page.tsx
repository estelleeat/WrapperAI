import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Youtube, Bot, Zap, Shield, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-[10px] text-white">W</div>
            WrapperAI
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Fonctionnalités</a>
            <a href="#solutions" className="hover:text-blue-600 transition-colors">Solutions</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Tarifs</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Connexion
            </Link>
            <Link href="/register" className="px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all shadow-sm">
              S'inscrire
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold mb-6 animate-fade-in">
            <Sparkles className="w-3 h-3" /> NOUVEAUTÉ : ASSISTANT RAG V1.0
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1]">
            Propulsez votre productivité <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 text-glow">avec l'intelligence artificielle.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-10 leading-relaxed">
            WrapperAI centralise vos outils IA indispensables. Réutilisez vos contenus vidéo et interrogez vos documents techniques en toute simplicité.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/workspace" className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 group">
              Commencer gratuitement <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all">
              Voir la démo
            </button>
          </div>
          
          <div className="mt-16 relative max-w-5xl mx-auto">
             <div className="absolute inset-0 bg-blue-500/10 blur-[120px] rounded-full"></div>
             <div className="relative border border-slate-200 rounded-2xl shadow-2xl overflow-hidden bg-slate-50">
                <Image 
                  src="/app-screenshot.png" 
                  alt="Interface WrapperAI" 
                  width={1200} 
                  height={800} 
                  className="w-full h-auto object-cover"
                  priority
                />
             </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 text-glow">Deux outils, une seule plateforme.</h2>
            <p className="text-slate-600">Tout ce dont vous avez besoin pour gérer vos contenus et documents.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Tool 1 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600 mb-6 group-hover:scale-110 transition-transform">
                <Youtube className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-slate-900">Studio de Recréation Vidéo</h3>
              <p className="text-slate-600 mb-6">
                Transformez instantanément n'importe quelle vidéo YouTube en articles de blog optimisés, threads Twitter percutants ou posts LinkedIn professionnels.
              </p>
              <ul className="space-y-3">
                {['Extraction automatique de transcript', 'IA Marketing spécialisée', 'Export multi-format'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-500">
                    <Zap className="w-4 h-4 text-blue-500" /> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tool 2 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-slate-900">Assistant Appels d'Offres (RAG)</h3>
              <p className="text-slate-600 mb-6">
                Importez vos PDF et laissez notre IA répondre à vos questions complexes. Idéal pour analyser des dossiers techniques ou préparer des réponses aux appels d'offres.
              </p>
              <ul className="space-y-3">
                {['Analyse sémantique profonde', 'Citations des sources exactes', 'Stockage vectoriel sécurisé'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-500">
                    <Zap className="w-4 h-4 text-blue-500" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center">
            <Shield className="w-8 h-8 text-slate-400 mb-4" />
            <h4 className="font-bold text-slate-900 mb-2">Données Sécurisées</h4>
            <p className="text-sm text-slate-500">Vos documents et transcripts sont chiffrés et privés.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Zap className="w-8 h-8 text-slate-400 mb-4" />
            <h4 className="font-bold text-slate-900 mb-2">Vitesse Éclair</h4>
            <p className="text-sm text-slate-500">Analyse de PDF de 50 pages en moins de 30 secondes.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Sparkles className="w-8 h-8 text-slate-400 mb-4" />
            <h4 className="font-bold text-slate-900 mb-2">Qualité Premium</h4>
            <p className="text-sm text-slate-500">Utilise les derniers modèles de langage les plus performants.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 px-6 text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 font-bold text-white text-lg">
            <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center text-[8px]">W</div>
            WrapperAI
          </div>
          <div className="flex gap-8 text-sm">
            <a href="#" className="hover:text-white transition-colors">Contact</a>
            <a href="#" className="hover:text-white transition-colors">Mentions Légales</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
          </div>
          <p className="text-xs">© 2026 WrapperAI. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
