import { news, localizeNews } from '../data/news.js';
import { newsPath, newsTopics, tagsFor } from '../data/newsTopics.js';

export const SITE_URL = 'https://deadmatterwiki.com';
export const SHARE_IMAGE = 'https://horizons-cdn.hostinger.com/783fa02e-1caf-48c3-baf6-d554d2d507fa/dead_matter_og_image.jpg';
export const jsonLd = value => JSON.stringify(value).replace(/</g, '\\u003c');

export function newsMetadata(article, language) {
  const url = SITE_URL + newsPath(language, article?.slug);
  const title = article ? `${localizeNews(article.title, language)} | Dead Matter News` : language === 'es' ? 'Noticias de Dead Matter: desarrollo y comunidad | Dead Matter Wiki' : 'Dead Matter News: Development & Community Updates | Dead Matter Wiki';
  const description = article ? localizeNews(article.summary, language) : language === 'es' ? 'Noticias de Dead Matter sobre infectados, armas, Canmore y el desarrollo del juego. Resúmenes con fuentes oficiales y novedades de la comunidad.' : 'Follow Dead Matter news on infected, weapons, Canmore and game development. Read sourced developer updates, previews and community news.';
  const breadcrumbs = [{ '@type': 'ListItem', position: 1, name: 'Dead Matter Wiki', item: SITE_URL + '/' }, { '@type': 'ListItem', position: 2, name: language === 'es' ? 'Noticias' : 'News', item: SITE_URL + newsPath(language) }];
  if (article) breadcrumbs.push({ '@type': 'ListItem', position: 3, name: localizeNews(article.title, language), item: url });
  const entity = article ? {
    '@type': 'NewsArticle', '@id': url + '#article', url,
    headline: localizeNews(article.title, language), description, inLanguage: language,
    datePublished: `${article.date}T00:00:00+04:00`,
    ...(article.modified ? { dateModified: `${article.modified}T00:00:00+04:00` } : {}),
    author: { '@type': 'Organization', name: 'Dead Matter Wiki', url: SITE_URL + '/' },
    publisher: { '@type': 'Organization', name: 'Dead Matter Wiki', url: SITE_URL + '/' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    articleSection: article.category,
    keywords: tagsFor(article).map(tag => localizeNews(newsTopics[tag], language)),
    about: { '@type': 'VideoGame', name: 'Dead Matter' },
    citation: article.sources.map(source => source.url),
    articleBody: localizeNews(article.body, language).join('\n\n')
  } : {
    '@type': 'CollectionPage', '@id': url, url, name: title, description, inLanguage: language,
    mainEntity: { '@type': 'ItemList', itemListElement: news.map((item, i) => ({ '@type': 'ListItem', position: i + 1, url: SITE_URL + newsPath(language, item.slug), name: localizeNews(item.title, language) })) }
  };
  return { url, title, description, structuredData: { '@context': 'https://schema.org', '@graph': [entity, { '@type': 'BreadcrumbList', itemListElement: breadcrumbs }] } };
}
