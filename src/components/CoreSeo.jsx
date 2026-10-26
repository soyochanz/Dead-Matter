import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { coreLanguage, corePath, gameGuide, languages } from '@/data/gameGuide';
import { SITE_URL, jsonLd } from '@/lib/newsSeo';

export function useCoreLanguage() {
  const { pathname } = useLocation();
  const { i18n } = useTranslation();
  const language = coreLanguage(pathname);
  useEffect(() => { if (i18n.language !== language) i18n.changeLanguage(language); }, [language, i18n]);
  return language;
}

export function CoreLanguages({ page = '', language }) {
  return <nav aria-label="Languages" className="flex flex-wrap justify-center gap-4 text-sm my-6">
    {languages.map((code, i) => <Link key={code} to={corePath(code, page)} lang={code} hrefLang={code} aria-current={code === language ? 'page' : undefined} className={code === language ? 'text-white font-bold' : 'text-slate-400 hover:text-red-400'}>{['English', 'Español', 'Português'][i]}</Link>)}
  </nav>;
}

export default function CoreSeo({ page = '', language }) {
  const copy = gameGuide[language];
  const title = page === 'wiki' ? copy.wikiTitle : page ? copy.title : copy.homeTitle;
  const description = page === 'wiki' ? copy.wikiDescription : page ? copy.description : copy.homeDescription;
  const url = SITE_URL + corePath(language, page);
  const graph = [
    { '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: 'Dead Matter Wiki', url: SITE_URL },
    { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, name: 'Dead Matter Wiki', url: SITE_URL, inLanguage: languages, publisher: { '@id': `${SITE_URL}/#organization` } },
    { '@type': page === 'wiki' ? 'CollectionPage' : 'WebPage', '@id': `${url}#webpage`, url, name: title, description, inLanguage: language, isPartOf: { '@id': `${SITE_URL}/#website` }, about: { '@type': 'VideoGame', name: 'Dead Matter', sameAs: 'https://store.steampowered.com/app/2184150/Dead_Matter/' } }
  ];
  if (page) graph.push({ '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: copy.home, item: SITE_URL + corePath(language) },
    { '@type': 'ListItem', position: 2, name: page === 'wiki' ? copy.wiki : copy.guide, item: url }
  ] });
  return <Helmet>
    <html lang={language} /><title>{title}</title>
    <meta name="description" content={description} /><meta name="robots" content="index,follow,max-image-preview:large" />
    <link rel="canonical" href={url} />
    {[...languages, 'x-default'].map(code => <link key={code} rel="alternate" hrefLang={code} href={SITE_URL + corePath(code === 'x-default' ? 'en' : code, page)} />)}
    <meta property="og:type" content="website" /><meta property="og:title" content={title} /><meta property="og:description" content={description} /><meta property="og:url" content={url} />
    <meta property="og:locale" content={{en: 'en_US', es: 'es_ES', pt: 'pt_BR'}[language]} />
    <meta property="twitter:card" content="summary" /><meta property="twitter:title" content={title} /><meta property="twitter:description" content={description} />
    <script type="application/ld+json">{jsonLd({ '@context': 'https://schema.org', '@graph': graph })}</script>
  </Helmet>;
}
