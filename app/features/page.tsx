import Link from 'next/link';
import { Youtube, Bot, Zap, Brain, Share2, FileText, CheckCircle2 } from 'lucide-react';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-[10px] text-white">W</div>
            WrapperAI
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link href="/features" className="text-blue-600">Fonctionnalités</Link>
            <Link href="/solutions" className="hover:text-blue-600 transition-colors">Solutions</Link>
            <Link href="/pricing" className="hover:text-blue-600 transition-colors">Tarifs</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Connexion</Link>
            <Link href="/register" className="px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all shadow-sm">S'inscrire</Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Tout ce dont vous avez besoin.<br/>Rien de superflu.</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Découvrez comment nos outils d'IA spécialisés peuvent transformer votre flux de travail quotidien.</p>
          </div>

          {/* Feature 1 */}
          <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 aspect-video flex items-center justify-center">
                <Youtube className="w-32 h-32 text-red-500 opacity-80" />
            </div>
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold mb-4">STUDIO VIDÉO</div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Repurposez vos vidéos en un clic.</h2>
                <p className="text-slate-600 mb-6 leading-relaxed">Ne laissez pas vos meilleures vidéos dormir. Transformez chaque vidéo YouTube en une mine d'or de contenu écrit pour tous vos canaux.</p>
                <ul className="space-y-4">
                    {[
                        "Extraction automatique de transcript haute précision",
                        "Génération d'articles de blog SEO-friendly",
                        "Création de threads Twitter/X viraux",
                        "Rédaction de posts LinkedIn engageants"
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-700">
                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-4">ASSISTANT RAG</div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Votre second cerveau technique.</h2>
                <p className="text-slate-600 mb-6 leading-relaxed">Analysez des centaines de pages de documentation technique, d'appels d'offres ou de rapports en quelques secondes.</p>
                <ul className="space-y-4">
                    {[
                        "Import de fichiers PDF illimité",
                        "Recherche sémantique vectorielle (RAG)",
                        "Citations précises des sources",
                        "Réponses contextuelles par IA générative"
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-700">
                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="order-1 md:order-2 bg-slate-50 p-8 rounded-2xl border border-slate-200 aspect-video flex items-center justify-center">
                <Bot className="w-32 h-32 text-blue-500 opacity-80" />
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-slate-50 py-12 border-t border-slate-200 text-center text-slate-500 text-sm">
        © 2026 WrapperAI. Propulsé par l'intelligence artificielle.
      </footer>
    </div>
  );
}
