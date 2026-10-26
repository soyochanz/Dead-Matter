import React from 'react';
import { Link } from 'react-router-dom';
import { localizeNews } from '@/data/news';
import { newsPath, newsTopics, tagsFor } from '@/data/newsTopics';

export default function NewsTags({ article, language }) {
  return <div className="flex flex-wrap gap-2" aria-label={language === 'es' ? 'Temas' : 'Topics'}>
    {tagsFor(article).map(tag => <Link key={tag} to={`${newsPath(language)}?tag=${tag}`} className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-white hover:border-red-400/60 transition-colors">{localizeNews(newsTopics[tag], language)}</Link>)}
  </div>;
}
