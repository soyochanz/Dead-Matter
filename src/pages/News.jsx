import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ExternalLink, Newspaper, Search } from 'lucide-react';
import { news, localizeNews } from '@/data/news';
import NewsCard from '@/components/NewsCard';

export default function News() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const article = news.find(item => item.slug === slug);
  const date = value => new Date(`${value}T12:00:00`).toLocaleDateString(i18n.language, { year: 'numeric', month: 'long', day: 'numeric' });

  if (slug) return (
    <div className="max-w-3xl mx-auto py-10 md:py-16">
      <Helmet><title>{article ? localizeNews(article.title, i18n.language) : t('news.not_found')} | Dead Matter Wiki</title>{article ? <meta name="description" content={localizeNews(article.summary, i18n.language)} /> : <meta name="robots" content="noindex" />}</Helmet>
      <Link to="/news" className="inline-flex items-center gap-2 text-red-400 mb-8"><ArrowLeft size={16} />{t('news.back')}</Link>
      {!article ? <h1 className="text-3xl text-white font-bold">{t('news.not_found')}</h1> : <article>
        <p className="text-red-400 font-bold text-sm uppercase tracking-widest mb-4">{t(`news.categories.${article.category}`)}</p>
        <h1 className="text-3xl md:text-5xl text-white font-black leading-tight tracking-tight">{localizeNews(article.title, i18n.language)}</h1>
        <p className="text-slate-400 text-sm mt-6">{t('news.published')} <time dateTime={article.date}>{date(article.date)}</time> · {t('news.source_date')} <time dateTime={article.sourceDate}>{date(article.sourceDate)}</time></p>
        <p className="text-xl text-slate-300 leading-relaxed mt-8 mb-10">{localizeNews(article.summary, i18n.language)}</p>
        <div className="space-y-6 text-slate-300 leading-relaxed">{localizeNews(article.body, i18n.language).map((paragraph, i) => <p key={i}>{paragraph}</p>)}</div>
        <aside className="mt-10 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
          <h2 className="font-bold text-white mb-3">{t('news.sources')}</h2>
          <p className="text-sm text-slate-400 mb-4">{t('news.source_note')}</p>
          <ul className="space-y-3">{article.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-red-400 hover:underline text-sm">{source.label}<ExternalLink size={13} /></a></li>)}</ul>
        </aside>
      </article>}
    </div>
  );

  const filtered = news.filter(item => (category === 'all' || item.category === category) && `${localizeNews(item.title, i18n.language)} ${localizeNews(item.summary, i18n.language)}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
  return (
    <div className="max-w-6xl mx-auto py-10 md:py-16">
      <Helmet><title>News | Dead Matter Wiki</title><meta name="description" content={t('news.subtitle')} /></Helmet>
      <div className="max-w-3xl mb-10">
        <span className="inline-flex items-center gap-2 text-red-400 text-sm font-bold mb-5"><Newspaper size={18} /> DEAD MATTER WIKI</span>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">NEWS<span className="text-red-500">.</span></h1>
        <p className="mt-5 text-lg text-slate-400 leading-relaxed">{t('news.subtitle')}</p>
      </div>
      <div className="flex flex-col lg:flex-row gap-5 justify-between mb-8">
        <div className="flex flex-wrap gap-2" aria-label={t('news.filter')}>
          {['all', 'game', 'development', 'community'].map(value => <button key={value} onClick={() => setCategory(value)} aria-pressed={category === value} className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ${category === value ? 'bg-red-600 text-white border-red-600' : 'border-white/10 text-slate-400 hover:text-white'}`}>{t(`news.categories.${value}`)}</button>)}
        </div>
        <label className="relative block lg:w-72"><Search size={16} className="absolute top-3.5 left-3 text-slate-500" /><input type="search" aria-label={t('news.search')} placeholder={t('news.search')} value={search} onChange={e => setSearch(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#111318] pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-red-400" /></label>
      </div>
      {filtered.length ? <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">{filtered.map(item => <NewsCard key={item.slug} article={item} />)}</div> : <p role="status" className="p-10 text-center text-slate-400 border border-white/10 rounded-2xl">{t('news.empty')}</p>}
    </div>
  );
}
