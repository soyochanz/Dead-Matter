import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Newspaper } from 'lucide-react';
import { localizeNews } from '@/data/news';

export default function NewsCard({ article }) {
  const { t, i18n } = useTranslation();
  return (
    <article className="flex flex-col rounded-2xl border border-white/10 bg-[#111318] p-6 hover:border-red-500/40 transition-colors">
      <div className="flex items-center justify-between gap-3 text-xs mb-5">
        <span className="flex items-center gap-2 text-red-400 font-bold"><Newspaper size={16} />{t(`news.categories.${article.category}`)}</span>
        <time dateTime={article.date} className="text-slate-400">{new Date(`${article.date}T12:00:00`).toLocaleDateString(i18n.language)}</time>
      </div>
      <h3 className="text-xl font-bold leading-snug text-white mb-3"><Link to={`/news/${article.slug}`} className="hover:text-red-400">{localizeNews(article.title, i18n.language)}</Link></h3>
      <p className="text-sm leading-relaxed text-slate-400 flex-1">{localizeNews(article.summary, i18n.language)}</p>
      <Link to={`/news/${article.slug}`} className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-sm font-bold text-red-400 hover:text-red-300">{t('news.read')}<ArrowRight size={15} /></Link>
    </article>
  );
}
