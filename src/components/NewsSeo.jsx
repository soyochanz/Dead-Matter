import React from 'react';
import { Helmet } from 'react-helmet';
import { newsMetadata, SITE_URL, SHARE_IMAGE, jsonLd } from '@/lib/newsSeo';
import { newsPath } from '@/data/newsTopics';

export default function NewsSeo({ article, language, filtered = false, missing = false }) {
  const meta = newsMetadata(article, language);
  return <Helmet>
    <html lang={language} />
    <title>{missing ? '404 | Dead Matter News' : meta.title}</title>
    <meta name="description" content={meta.description} />
    <meta name="robots" content={filtered || missing ? 'noindex,follow' : 'index,follow,max-image-preview:large'} />
    <link rel="canonical" href={meta.url} />
    {!missing && ['en', 'es', 'x-default'].map(lang => <link key={lang} rel="alternate" hrefLang={lang} href={SITE_URL + newsPath(lang === 'es' ? 'es' : 'en', article?.slug)} />)}
    <link rel="alternate" type="application/rss+xml" title="Dead Matter News" href={`${SITE_URL}/news-feed${language === 'es' ? '-es' : ''}.xml`} />
    <meta property="og:type" content={article ? 'article' : 'website'} />
    <meta property="og:title" content={meta.title} />
    <meta property="og:description" content={meta.description} />
    <meta property="og:url" content={meta.url} />
    <meta property="og:image" content={SHARE_IMAGE} />
    <meta property="og:site_name" content="Dead Matter Wiki" />
    <meta property="og:locale" content={language === 'es' ? 'es_ES' : 'en_US'} />
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:title" content={meta.title} />
    <meta property="twitter:description" content={meta.description} />
    <meta property="twitter:url" content={meta.url} />
    <meta property="twitter:image" content={SHARE_IMAGE} />
    {article && <meta property="article:published_time" content={`${article.date}T00:00:00+04:00`} />}
    {!missing && <script type="application/ld+json">{jsonLd(meta.structuredData)}</script>}
  </Helmet>;
}
