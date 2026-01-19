import Link from 'next/link';
import { Check } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-[10px] text-white">W</div>
            WrapperAI
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link href="/features" className="hover:text-blue-600 transition-colors">Fonctionnalités</Link>
            <Link href="/solutions" className="hover:text-blue-600 transition-colors">Solutions</Link>
            <Link href="/pricing" className="text-blue-600">Tarifs</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Connexion</Link>
            <Link href="/register" className="px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all shadow-sm">S'inscrire</Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Commencez gratuitement.</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Pas de carte de crédit requise. Mettez à niveau quand vous grandissez.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-slate-900 text-lg mb-2">Découverte</h3>
                <div className="text-4xl font-extrabold text-slate-900 mb-6">0€<span className="text-lg text-slate-500 font-medium">/mois</span></div>
                <p className="text-sm text-slate-600 mb-8">Parfait pour tester la puissance de l'IA.</p>
                <Link href="/register" className="block w-full py-3 bg-white border border-slate-200 text-slate-900 font-bold rounded-xl text-center hover:bg-slate-50 transition-colors mb-8">
                    Commencer
                </Link>
                <ul className="space-y-4 text-sm text-slate-600">
                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-green-500" /> 3 Repurposing vidéo / mois</li>
                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-green-500" /> 10 Mo de documents RAG</li>
                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-green-500" /> Modèle Standard (Gemini Flash)</li>
                </ul>
            </div>

            {/* Pro Plan */}
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-white relative transform md:-translate-y-4 shadow-xl">
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">POPULAIRE</div>
                <h3 className="font-bold text-white text-lg mb-2">Pro</h3>
                <div className="text-4xl font-extrabold text-white mb-6">29€<span className="text-lg text-slate-400 font-medium">/mois</span></div>
                <p className="text-sm text-slate-400 mb-8">Pour les créateurs et professionnels actifs.</p>
                <Link href="/register" className="block w-full py-3 bg-blue-600 text-white font-bold rounded-xl text-center hover:bg-blue-700 transition-colors mb-8 shadow-lg shadow-blue-900/20">
                    Essayer Pro
                </Link>
                <ul className="space-y-4 text-sm text-slate-300">
                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-blue-400" /> Repurposing illimité</li>
                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-blue-400" /> 1 Go de documents RAG</li>
                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-blue-400" /> Modèle Premium (Llama 3 70B / GPT-4)</li>
                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-blue-400" /> Support prioritaire</li>
                </ul>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-slate-900 text-lg mb-2">Entreprise</h3>
                <div className="text-4xl font-extrabold text-slate-900 mb-6">Sur devis</div>
                <p className="text-sm text-slate-600 mb-8">Sécurité avancée et intégrations sur mesure.</p>
                <button className="block w-full py-3 bg-white border border-slate-200 text-slate-900 font-bold rounded-xl text-center hover:bg-slate-50 transition-colors mb-8">
                    Contacter les ventes
                </button>
                <ul className="space-y-4 text-sm text-slate-600">
                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-green-500" /> Tout illimité</li>
                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-green-500" /> SSO / SAML</li>
                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-green-500" /> Données privées isolées</li>
                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-green-500" /> SLA garanti</li>
                </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
