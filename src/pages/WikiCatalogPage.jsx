import ItemPresentation, { ItemCard, itemAccent } from '@/components/wiki/ItemPresentation';
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams, useLocation } from 'react-router-dom';
import { useCoreLanguage } from '@/components/CoreSeo';
import { catalog, wikiLanguages, categoryNames, categoryName, itemPath, itemDescription, fieldName, fieldValue, relationName, catalogCopy } from '@/lib/wikiCatalog';
import { SITE_URL, jsonLd } from '@/lib/newsSeo';

export default function WikiCatalogPage({ category: categoryProp }) {
  const params = useParams();
  const category = categoryProp || params.categoryName;
  const slug = params.itemSlug;
  const language = useCoreLanguage();
  const copy = catalogCopy[language];
  const { search } = useLocation();
  const [query, setQuery] = useState('');
  const items = catalog.filter(item => item.category === category);
  const item = slug ? items.find(item => item.slug === slug) : null;
  const missing = !items.length || (slug && !item);
  const name = categoryName(category, language);
  const path = itemPath(category, slug, language);
  const url = SITE_URL + path;
  const title = missing ? `${copy.missing} | Dead Matter Wiki` : item ? `${item.name} — Dead Matter ${name} Wiki${item.disambiguator ? ` (${item.disambiguator})` : ''}` : `Dead Matter ${name} — ${items.length} ${copy.count} | Wiki`;
  const description = item ? itemDescription(item, language) : `${name}: ${items.length} ${copy.count}. ${copy.intro}`;
  const graph = missing ? [] : [{
    '@type': item ? 'TechArticle' : 'CollectionPage', '@id': `${url}#page`, url, name: title, ...(item ? { headline: title } : {}), description, inLanguage: language,
    about: { '@type': 'VideoGame', name: 'Dead Matter' },
    ...(item ? { author: { '@type': 'Organization', name: 'Dead Matter Wiki', url: SITE_URL }, ...(item.image ? { image: item.image } : {}) } : { mainEntity: { '@type': 'ItemList', numberOfItems: items.length, itemListElement: items.map((entry, i) => ({ '@type': 'ListItem', position: i + 1, name: entry.name, url: SITE_URL + itemPath(category, entry.slug, language) })) } })
  }, { '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Wiki', item: SITE_URL + (language === 'en' ? '/wiki' : `/${language}/wiki`) },
    { '@type': 'ListItem', position: 2, name, item: SITE_URL + itemPath(category, '', language) },
    ...(item ? [{ '@type': 'ListItem', position: 3, name: item.name, item: url }] : [])
  ] }];
  const filters = items.filter(entry => entry.name.toLowerCase().includes(query.toLowerCase()));
  return <>
    <Helmet>
      <html lang={language} /><title>{title}</title><meta name="description" content={description} />
      <meta name="robots" content={missing || search ? 'noindex,follow' : 'index,follow,max-image-preview:large'} />
      <link rel="canonical" href={url} />
      {!missing && [...wikiLanguages, 'x-default'].map(code => <link key={code} rel="alternate" hrefLang={code} href={SITE_URL + itemPath(category, slug, code === 'x-default' ? 'en' : code)} />)}
      <meta property="og:title" content={title} /><meta property="og:description" content={description} /><meta property="og:url" content={url} /><meta property="og:type" content={item ? 'article' : 'website'} />
      <meta property="og:locale" content={{ en: 'en_US', es: 'es_ES', pt: 'pt_BR' }[language]} />
      {item?.image && <meta property="og:image" content={item.image} />}
      <meta property="twitter:title" content={title} /><meta property="twitter:description" content={description} /><meta property="twitter:url" content={url} />
      <meta property="twitter:card" content={item?.image ? 'summary_large_image' : 'summary'} />
      {item?.image && <meta property="twitter:image" content={item.image} />}
      {!missing && <script type="application/ld+json">{jsonLd({ '@context': 'https://schema.org', '@graph': graph })}</script>}
    </Helmet>
    <article className="wiki-catalog" style={{'--item-accent':itemAccent(category)}}>
      <nav aria-label="Breadcrumb" className="flex flex-wrap gap-3 text-sm text-slate-400"><Link to={language === 'en' ? '/wiki' : `/${language}/wiki`}>Wiki</Link><span>/</span><Link to={itemPath(category, '', language)}>{name}</Link>{item && <><span>/</span><span className="text-slate-200">{item.name}</span></>}</nav>
      <header className="wiki-catalog__header space-y-4"><p className="text-red-400 text-xs uppercase tracking-widest font-bold">Dead Matter · {copy.entry}</p><h1 className="text-4xl md:text-6xl font-black tracking-tight text-white break-words">{missing ? copy.missing : item ? `${item.name} — Dead Matter` : `Dead Matter ${name}`}</h1><p className="text-slate-400 max-w-3xl leading-relaxed">{missing ? copy.back : item ? description : copy.intro}</p>{item?.disambiguator && <p className="text-xs text-slate-500">{copy.variant}: {item.disambiguator}</p>}</header>
      {!missing && <nav aria-label="Languages" className="wiki-catalog__languages">{wikiLanguages.map((code,i) => <Link key={code} lang={code} hrefLang={code} aria-current={code === language ? 'page' : undefined} className={code === language ? 'text-white font-bold' : 'text-slate-400 hover:text-white'} to={itemPath(category, slug, code)}>{['English','Español','Português'][i]}</Link>)}</nav>}
      {item ? <ItemPresentation item={item} items={items} language={language} /> : !missing && <section className="space-y-6"><label className="block max-w-lg text-sm text-slate-400">{copy.search}<input type="search" value={query} onChange={e=>setQuery(e.target.value)} className="block w-full mt-2 bg-white/5 border border-white/15 rounded-xl p-3 text-white" /></label><h2 className="text-lg font-bold text-white">{copy.records} · {filters.length}</h2><div className="wiki-item-grid">{filters.map(entry => <ItemCard key={entry.slug} item={entry} language={language} />)}</div></section>}
      <nav className="wiki-catalog__footer flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400" aria-label={copy.directory}><Link to={language === 'en' ? '/wiki' : `/${language}/wiki`}>{copy.back}</Link>{Object.keys(categoryNames).map(cat => <Link key={cat} to={itemPath(cat,'',language)}>{categoryName(cat,language)}</Link>)}{!['ammo','materials','vehicle-parts'].includes(category) && <Link to={`/wiki/${category}?view=interactive${item ? `&item=${item.slug}&record=${item.id}` : ''}`}>{copy.tools} →</Link>}</nav>
    </article>
  </>;
}
