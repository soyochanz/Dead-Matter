import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ExternalLink, Newspaper, Search } from 'lucide-react';
import { news, localizeNews } from '@/data/news';
import NewsCard from '@/components/NewsCard';
import NewsSeo from '@/components/NewsSeo';
import NewsTags from '@/components/NewsTags';
import { newsPath, newsLanguage, newsTopics, tagsFor, relatedNews, wikiLinksFor } from '@/data/newsTopics';

export default function News() {
  const { slug } = useParams();
  const { pathname } = useLocation();
  const [params, setParams] = useSearchParams();
  const { i18n } = useTranslation();
  const language = newsLanguage(pathname);
  const t = i18n.getFixedT(language);
  const tag = params.get('tag');
  useEffect(() => { i18n.changeLanguage(language); }, [language, i18n]);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const article = news.find(item => item.slug === slug);
  const date = value => new Date(`${value}T12:00:00`).toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' });
  const languageLinks = <nav aria-label="Article language" className="inline-flex rounded-full border border-white/10 p-1 gap-1 text-xs">
    {['en', 'es'].map(lang => <Link key={lang} to={newsPath(lang, slug)} hrefLang={lang} lang={lang} aria-current={language === lang ? 'page' : undefined} className={`rounded-full px-3 py-1.5 ${language === lang ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}>{lang === 'en' ? 'English' : 'Español'}</Link>)}
  </nav>;

  if (slug) return (
    <div className="max-w-3xl mx-auto py-10 md:py-16">
      <NewsSeo article={article} language={language} missing={!article} />
      <div className="flex flex-wrap justify-between gap-4 mb-8"><Link to={newsPath(language)} className="inline-flex items-center gap-2 text-red-400"><ArrowLeft size={16} />{t('news.back')}</Link>{languageLinks}</div>
      {!article ? <h1 className="text-3xl text-white font-bold">{t('news.not_found')}</h1> : <article>
        <nav aria-label={language === 'es' ? 'Ruta de navegación' : 'Breadcrumb'} className="mb-6 text-xs text-slate-400 flex flex-wrap gap-2"><Link to="/">Dead Matter Wiki</Link><span>/</span><Link to={newsPath(language)}>News</Link><span>/</span><span>{t(`news.categories.${article.category}`)}</span></nav>
        <p className="text-red-400 font-bold text-sm uppercase tracking-widest mb-4">{t(`news.categories.${article.category}`)}</p>
        <h1 className="text-3xl md:text-5xl text-white font-black leading-tight tracking-tight">{localizeNews(article.title, language)}</h1>
        <p className="text-slate-400 text-sm mt-6">{t('news.published')} <time dateTime={article.date}>{date(article.date)}</time> · {t('news.source_date')} <time dateTime={article.sourceDate}>{date(article.sourceDate)}</time></p>
        <p className="text-xs text-slate-400 mt-3 mb-5">{language === 'es' ? 'Por' : 'By'} <Link to="/" className="text-slate-200 hover:underline">Dead Matter Wiki</Link></p>
        <NewsTags article={article} language={language} />
        <p className="text-xl text-slate-300 leading-relaxed mt-8 mb-10">{localizeNews(article.summary, language)}</p>
        <div className="space-y-6 text-slate-300 leading-relaxed">{localizeNews(article.body, language).map((paragraph, i) => <p key={i}>{paragraph}</p>)}</div>
        <aside className="mt-10 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
          <h2 className="font-bold text-white mb-3">{t('news.sources')}</h2>
          <p className="text-sm text-slate-400 mb-4">{t('news.source_note')}</p>
          <ul className="space-y-3">{article.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-red-400 hover:underline text-sm">{source.label}<ExternalLink size={13} /></a></li>)}</ul>
        </aside>
        <aside className="mt-6 p-6 rounded-2xl bg-[#111318] border border-white/10">
          <h2 className="font-bold text-white mb-3">{language === 'es' ? 'Explora la wiki' : 'Explore the wiki'}</h2>
          <ul className="space-y-3">{wikiLinksFor(article).map(link => <li key={link.path}><Link className="text-sm text-slate-300 hover:text-red-400" to={link.path}>{link[language]} →</Link></li>)}</ul>
        </aside>
      </article>}
      {article && <section className="mt-14"><h2 className="text-2xl font-bold text-white mb-6">{language === 'es' ? 'Noticias relacionadas' : 'Related stories'}</h2><div className="grid md:grid-cols-2 gap-5">{relatedNews(article, news).map(item => <NewsCard key={item.slug} article={item} language={language} />)}</div></section>}
    </div>
  );

  const filtered = news.filter(item => (category === 'all' || item.category === category) && (!tag || tagsFor(item).includes(tag)) && `${localizeNews(item.title, language)} ${localizeNews(item.summary, language)} ${tagsFor(item).map(key => localizeNews(newsTopics[key], language)).join(' ')}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
  return (
    <div className="max-w-6xl mx-auto py-10 md:py-16">
      <NewsSeo language={language} filtered={params.size > 0} />
      <div className="flex justify-end mb-6">{languageLinks}</div>
      <div className="max-w-3xl mb-10">
        <span className="inline-flex items-center gap-2 text-red-400 text-sm font-bold mb-5"><Newspaper size={18} /> DEAD MATTER WIKI</span>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">{language === 'es' ? 'NOTICIAS' : 'NEWS'}<span className="text-red-500">.</span></h1>
        <p className="mt-5 text-lg text-slate-400 leading-relaxed">{t('news.subtitle')}</p>
      </div>
      <div className="flex flex-col lg:flex-row gap-5 justify-between mb-8">
        <div className="flex flex-wrap gap-2" aria-label={t('news.filter')}>
          {['all', 'game', 'development', 'community'].map(value => <button key={value} onClick={() => setCategory(value)} aria-pressed={category === value} className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ${category === value ? 'bg-red-600 text-white border-red-600' : 'border-white/10 text-slate-400 hover:text-white'}`}>{t(`news.categories.${value}`)}</button>)}
        </div>
        <label className="relative block lg:w-72"><Search size={16} className="absolute top-3.5 left-3 text-slate-500" /><input type="search" aria-label={t('news.search')} placeholder={t('news.search')} value={search} onChange={e => setSearch(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#111318] pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-red-400" /></label>
      </div>
      {tag && <div className="flex items-center gap-3 mb-6 text-sm text-slate-300"><span>{language === 'es' ? 'Tema' : 'Topic'}: {newsTopics[tag] ? localizeNews(newsTopics[tag], language) : tag}</span><button onClick={() => setParams({})} className="text-red-400 underline">{language === 'es' ? 'Quitar filtro' : 'Clear filter'}</button></div>}
      {filtered.length ? <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">{filtered.map(item => <NewsCard key={item.slug} article={item} language={language} />)}</div> : <p role="status" className="p-10 text-center text-slate-400 border border-white/10 rounded-2xl">{t('news.empty')}</p>}
    </div>
  );
}
