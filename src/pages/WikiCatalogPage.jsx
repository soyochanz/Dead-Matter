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
  const renderLink = entry => <Link to={itemPath(entry.category, entry.slug, language)} className="text-red-300 hover:text-white hover:underline">{entry.name}</Link>;
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
    <article className="max-w-6xl mx-auto px-2 md:px-4 py-10 space-y-10">
      <nav aria-label="Breadcrumb" className="flex flex-wrap gap-3 text-sm text-slate-400"><Link to={language === 'en' ? '/wiki' : `/${language}/wiki`}>Wiki</Link><span>/</span><Link to={itemPath(category, '', language)}>{name}</Link>{item && <><span>/</span><span className="text-slate-200">{item.name}</span></>}</nav>
      <header className="space-y-5"><p className="text-red-400 text-xs uppercase tracking-widest font-bold">Dead Matter · {copy.entry}</p><h1 className="text-4xl md:text-6xl font-black tracking-tight text-white break-words">{missing ? copy.missing : item ? `${item.name} — Dead Matter` : `Dead Matter ${name}`}</h1><p className="text-slate-400 max-w-3xl leading-relaxed">{missing ? copy.back : item ? description : copy.intro}</p>{item?.disambiguator && <p className="text-xs text-slate-500">{copy.variant}: {item.disambiguator}</p>}</header>
      {!missing && <nav aria-label="Languages" className="flex flex-wrap gap-4 text-sm">{wikiLanguages.map((code,i) => <Link key={code} lang={code} hrefLang={code} aria-current={code === language ? 'page' : undefined} className={code === language ? 'text-white font-bold' : 'text-slate-400 hover:text-white'} to={itemPath(category, slug, code)}>{['English','Español','Português'][i]}</Link>)}</nav>}
      {item ? <>
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">{item.image && <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-8"><img src={item.image} alt={`${item.name} — Dead Matter`} width="640" height="480" className="w-full h-64 md:h-80 object-contain" /></div>}
            {item.description ? <section className="space-y-3"><h2 className="text-sm text-slate-400">{language === 'en' ? item.name : copy.original}</h2><p lang="en" className="text-slate-200 leading-relaxed whitespace-pre-line">{item.description}</p></section> : <p className="text-sm text-slate-500">{copy.empty}</p>}
          </div>
          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6"><h2 className="text-xl text-white font-bold mb-5">{copy.details}</h2><dl className="divide-y divide-white/10">{Object.entries(item.attributes).map(([key,value]) => <div key={key} className="grid grid-cols-2 gap-4 py-3"><dt className="text-slate-400 text-sm">{fieldName(key,language)}</dt><dd className="text-slate-100 text-sm break-words">{fieldValue(value,language)}</dd></div>)}</dl>{!Object.keys(item.attributes).length && <p className="text-slate-400">{copy.unknown}</p>}</section>
        </div>
        {[...new Set(item.relations.map(link => link.kind))].map(kind => <section key={kind} className="space-y-4"><h2 className="text-xl text-white font-bold">{relationName(kind,language)}</h2><ul className="flex flex-wrap gap-3">{item.relations.filter(link => link.kind === kind).map(link => <li key={`${kind}-${link.category}-${link.slug}`} className="rounded-xl border border-white/10 px-4 py-3">{renderLink(link)}{link.quantity ? <span className="text-slate-400"> × {link.quantity}</span> : null}</li>)}</ul></section>)}
        <aside className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.025] p-6 space-y-3"><h2 className="text-base font-bold text-slate-200">{copy.source}</h2><p className="text-sm text-slate-400 leading-relaxed">{copy.note}</p></aside>
        <section className="space-y-4"><h2 className="text-xl font-bold text-white">{copy.related}</h2><ul className="flex flex-wrap gap-5">{items.filter(entry => entry.slug !== slug).sort((a,b) => Number(b.attributes.subcategory === item.attributes.subcategory) - Number(a.attributes.subcategory === item.attributes.subcategory)).slice(0,6).map(entry => <li key={entry.slug}>{renderLink(entry)}</li>)}</ul></section>
      </> : !missing && <section className="space-y-6"><label className="block max-w-lg text-sm text-slate-400">{copy.search}<input type="search" value={query} onChange={e=>setQuery(e.target.value)} className="block w-full mt-2 bg-white/5 border border-white/15 rounded-xl p-3 text-white" /></label><h2 className="text-lg font-bold text-white">{copy.records} · {filters.length}</h2><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{filters.map(entry => <Link key={entry.slug} to={itemPath(category,entry.slug,language)} className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 hover:border-red-400/50 transition-colors">{entry.image && <img src={entry.image} alt={entry.name} loading="lazy" width="320" height="160" className="w-full h-36 object-contain mb-5" />}<h3 className="font-bold text-white group-hover:text-red-300">{entry.name}</h3><p className="mt-2 text-xs text-slate-500">{entry.attributes.subcategory || entry.attributes.type || name}{entry.disambiguator ? ` · ${entry.disambiguator}` : ''}</p></Link>)}</div></section>}
      <nav className="flex flex-wrap gap-4 text-sm text-red-300" aria-label={copy.directory}><Link to={language === 'en' ? '/wiki' : `/${language}/wiki`}>{copy.back}</Link>{Object.keys(categoryNames).map(cat => <Link key={cat} to={itemPath(cat,'',language)}>{categoryName(cat,language)}</Link>)}{!['ammo','materials','vehicle-parts'].includes(category) && <Link to={`/wiki/${category}?view=interactive${item ? `&item=${item.slug}&record=${item.id}` : ''}`}>{copy.tools} →</Link>}</nav>
    </article>
  </>;
}
