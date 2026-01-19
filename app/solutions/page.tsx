import Link from 'next/link';
import { PenTool, Briefcase, GraduationCap, ArrowRight } from 'lucide-react';

export default function SolutionsPage() {
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
            <Link href="/solutions" className="text-blue-600">Solutions</Link>
            <Link href="/pricing" className="hover:text-blue-600 transition-colors">Tarifs</Link>
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
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Des solutions adaptées à votre métier.</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Que vous soyez créateur solo ou une grande entreprise, WrapperAI s'adapte à vos besoins.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all group cursor-pointer">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                    <PenTool className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Pour les Créateurs</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    Multipliez votre présence en ligne sans multiplier votre temps de travail. Transformez une vidéo YouTube par semaine en 10 contenus sociaux.
                </p>
                <div className="flex items-center text-blue-600 font-medium text-sm group-hover:gap-2 transition-all">
                    En savoir plus <ArrowRight className="w-4 h-4 ml-1" />
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all group cursor-pointer">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                    <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Pour les Entreprises</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    Analysez les appels d'offres plus vite que vos concurrents. Notre RAG sécurisé vous permet de digérer des centaines de pages techniques instantanément.
                </p>
                <div className="flex items-center text-blue-600 font-medium text-sm group-hover:gap-2 transition-all">
                    En savoir plus <ArrowRight className="w-4 h-4 ml-1" />
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all group cursor-pointer">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-6 group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Pour les Chercheurs</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    Centralisez vos papiers de recherche et posez des questions complexes à votre base de connaissance. Gagnez des heures de lecture.
                </p>
                <div className="flex items-center text-blue-600 font-medium text-sm group-hover:gap-2 transition-all">
                    En savoir plus <ArrowRight className="w-4 h-4 ml-1" />
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
