import React from 'react';
import { Link } from 'react-router-dom';
import { corePath, gameGuide } from '@/data/gameGuide';

export default function GameResources({ language, compact = false }) {
  const copy = gameGuide[language];
  return <section className="space-y-8">
    <div className="max-w-3xl space-y-4">
      <p className="text-red-400 text-xs uppercase tracking-widest font-bold">{copy.label}</p>
      <h2 className="text-3xl font-bold text-white">{compact ? copy.heading : copy.resourcesTitle}</h2>
      {compact && <><p className="text-slate-300 leading-relaxed">{copy.intro}</p><Link className="inline-block text-red-400 hover:underline" to={corePath(language, 'dead-matter-game')}>{copy.guide} →</Link></>}
    </div>
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {copy.resources.map(([route, title, body]) => <Link key={route} to={route === 'news' && language === 'es' ? '/es/news' : `/${route}`} className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 hover:border-red-400/50 transition-colors">
        <h3 className="text-white font-bold mb-3">{title} <span aria-hidden="true" className="text-red-400">↗</span></h3><p className="text-sm text-slate-400 leading-relaxed">{body}</p>
      </Link>)}
    </div>
  </section>;
}
