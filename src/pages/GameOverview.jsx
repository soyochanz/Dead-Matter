import React from 'react';
import { Link } from 'react-router-dom';
import CoreSeo, { useCoreLanguage } from '@/components/CoreSeo';
import GameResources from '@/components/GameResources';
import { corePath, gameGuide } from '@/data/gameGuide';

export default function GameOverview() {
  const language = useCoreLanguage();
  const copy = gameGuide[language];
  return <>
    <CoreSeo page="dead-matter-game" language={language} />
    <article className="max-w-6xl mx-auto px-4 py-12 md:py-20 space-y-12">
      <nav className="text-sm text-slate-400 flex flex-wrap gap-3" aria-label="Breadcrumb"><Link to={corePath(language)}>{copy.home}</Link><span>/</span><span>{copy.guide}</span></nav>
      <header className="max-w-3xl space-y-6"><p className="text-red-400 text-xs uppercase tracking-widest font-bold">{copy.label}</p><h1 className="text-4xl md:text-6xl text-white font-black tracking-tight">{copy.heading}</h1><p className="text-lg text-slate-300 leading-relaxed">{copy.intro}</p><p className="text-sm text-slate-500">{copy.reviewed}</p></header>
      <GameResources language={language} />
      <section className="max-w-3xl space-y-6"><h2 className="text-3xl text-white font-bold">{copy.faqTitle}</h2>{copy.faq.map(([q, a]) => <div key={q} className="border-b border-white/10 pb-6"><h3 className="text-lg font-semibold text-white mb-2">{q}</h3><p className="text-slate-400 leading-relaxed">{a}</p></div>)}</section>
      <section className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 space-y-4"><h2 className="text-xl font-bold text-white">{copy.sources}</h2><p className="text-slate-400 leading-relaxed">{copy.sourceNote}</p><div className="flex flex-wrap gap-5 text-red-400"><a href="https://store.steampowered.com/app/2184150/Dead_Matter/">{copy.steam}</a><a href="https://steamcommunity.com/app/2184150/allnews/">{copy.announcements}</a><Link to="/updates">{copy.patches}</Link><Link to="/micro-changes">{copy.commits}</Link><Link to={corePath(language, 'wiki')}>{copy.wiki}</Link></div></section>
    </article>
  </>;
}
