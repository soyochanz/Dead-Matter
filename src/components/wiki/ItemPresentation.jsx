import ItemSections, { ExtraItemSections, StatIcon, sectionIcons } from './ItemSections';
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Box, FileText, SlidersHorizontal } from 'lucide-react';
import { catalog, categoryName, itemPath, fieldName, fieldValue, relationName, catalogCopy, localized } from '@/lib/wikiCatalog';

const accents = { weapons: '#fb7185', accessories: '#fb7185', ammo: '#fbbf24', gear: '#34d399', toolbelts: '#2dd4bf', vehicles: '#60a5fa', 'vehicle-parts': '#60a5fa', keys: '#a5b4fc', basebuilding: '#fb923c', materials: '#fb923c', meds: '#f472b6', perks: '#c084fc', npcs: '#c084fc' };
const byPath = new Map(catalog.map(item => [`${item.category}/${item.slug}`, item]));
export const itemAccent = category => accents[category] || '#94a3b8';
const keyStats = item => Object.entries(item.attributes).filter(([key,value]) => !['rarity','subcategory','type','doors','spawn_locations','use_case','price','sell_price'].includes(key) && value !== 0 && value !== false && String(value).length < 32).slice(0,3);

export function ItemCard({ item, language, compact = false, quantity }) {
  const facts = keyStats(item).slice(0,2);
  return <Link to={itemPath(item.category,item.slug,language)} className={`wiki-item-card ${compact ? 'wiki-item-card--compact' : ''}`} style={{'--item-accent':itemAccent(item.category)}}>
    <div className="wiki-item-card__visual">
      {item.image ? <img src={item.image} alt={item.name} width="320" height="200" loading="lazy" decoding="async" /> : <Box size={38} strokeWidth={1} aria-hidden="true" />}
      <span className="wiki-item-card__arrow" aria-hidden="true"><ArrowUpRight size={16}/></span>
      {quantity && <span className="wiki-item-card__quantity">× {quantity}</span>}
    </div>
    <div className="wiki-item-card__body">
      <p className="wiki-item-eyebrow">{item.attributes.subcategory || categoryName(item.category,language)}</p>
      <h3>{item.name}</h3>
      {item.disambiguator && <span className="wiki-item-reference">{item.disambiguator}</span>}
      {!compact && facts.length > 0 && <dl className="wiki-item-card__facts">{facts.map(([key,value]) => <div key={key}><dt><StatIcon field={key}/>{fieldName(key,language)}</dt><dd>{fieldValue(value,language)}</dd></div>)}</dl>}
    </div>
    {!compact && <div className="wiki-item-card__footer"><span>{item.attributes.rarity || 'Dead Matter'}</span><span>{catalogCopy[language].entry} <ArrowUpRight size={13} aria-hidden="true"/></span></div>}
  </Link>;
}

export default function ItemPresentation({ item, items, language }) {
  const copy = catalogCopy[language];
  const stats = keyStats(item);
  const related = items.filter(entry=>entry.slug!==item.slug).sort((a,b)=>Number(b.attributes.subcategory===item.attributes.subcategory)-Number(a.attributes.subcategory===item.attributes.subcategory)).slice(0,4);
  const interactive = !['ammo','materials','vehicle-parts'].includes(item.category);
  return <div className="wiki-item-detail" style={{'--item-accent':itemAccent(item.category)}}>
    <div className="wiki-item-overview">
      <section className="wiki-item-showcase" aria-label={item.name}>
        <div className="wiki-item-showcase__top"><span className="wiki-item-eyebrow">{categoryName(item.category,language)}</span>{item.attributes.rarity && <span className="wiki-item-badge">{item.attributes.rarity}</span>}</div>
        <div className="wiki-item-showcase__image">{item.image ? <img src={item.image} alt={`${item.name} — Dead Matter`} width="640" height="480" fetchpriority="high" decoding="async"/> : <Box size={86} strokeWidth={.8} aria-hidden="true"/>}</div>
        <div className="wiki-item-showcase__caption"><span>{item.name}</span><span>DEAD MATTER WIKI</span></div>
        {stats.length > 0 && <dl className="wiki-item-highlights">{stats.map(([key,value])=><div key={key}><dt>{fieldName(key,language)}</dt><dd>{fieldValue(value,language)}</dd></div>)}</dl>}
      </section>
      <section className="wiki-item-specs">
        <div className="wiki-item-section-heading"><div><p className="wiki-item-eyebrow">{copy.entry}</p><h2>{copy.details}</h2></div><SlidersHorizontal size={20} aria-hidden="true"/></div>
        <ItemSections item={item} language={language}/>
        {!Object.keys(item.attributes).length && <p className="wiki-item-muted">{copy.unknown}</p>}
        {interactive && <Link className="wiki-item-action" to={`/wiki/${item.category}?view=interactive&item=${item.slug}&record=${item.id}`}><SlidersHorizontal size={16} aria-hidden="true"/>{copy.tools}<ArrowUpRight size={17} aria-hidden="true"/></Link>}
      </section>
    </div>
    <ExtraItemSections item={item} language={language}/>
    {item.description && <section className="wiki-item-description"><FileText size={20} aria-hidden="true"/><div><h2>{language==='en' ? localized(['Description','Descripción','Descrição'],language) : copy.original}</h2><p lang="en">{item.description}</p></div></section>}
    {[...new Set(item.relations.map(link=>link.kind))].map(kind=><section key={kind} className="wiki-item-section"><div className="wiki-item-section-heading"><h2>{React.createElement(sectionIcons[kind] || Box,{size:20,"aria-hidden":true})}{relationName(kind,language)}</h2><span className="wiki-item-count">{item.relations.filter(link=>link.kind===kind).length}</span></div><ul className="wiki-item-connections">{item.relations.filter(link=>link.kind===kind).map(link=>{const record=byPath.get(`${link.category}/${link.slug}`);return <li key={`${kind}-${link.category}-${link.slug}`}>{record ? <ItemCard item={record} language={language} compact quantity={link.quantity}/> : <Link to={itemPath(link.category,link.slug,language)}>{link.name}</Link>}</li>;})}</ul></section>)}
    {related.length > 0 && <section className="wiki-item-section"><div className="wiki-item-section-heading"><h2>{copy.related}</h2><Link to={itemPath(item.category,'',language)}>{categoryName(item.category,language)} <ArrowUpRight size={15} aria-hidden="true"/></Link></div><div className="wiki-item-grid">{related.map(entry=><ItemCard key={entry.slug} item={entry} language={language}/>)}</div></section>}
    <aside className="wiki-item-source"><FileText size={17} aria-hidden="true"/><div><h2>{copy.source}</h2><p>{copy.note}</p></div></aside>
  </div>;
}
