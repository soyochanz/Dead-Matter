import React, { useId, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowUpRight } from 'lucide-react';
import { catalog, categoryName, itemPath, localized } from '@/lib/wikiCatalog';

const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export default function WikiSearch({ language }) {
  const [query,setQuery] = useState('');
  const [open,setOpen] = useState(false);
  const [active,setActive] = useState(-1);
  const id = useId();
  const navigate = useNavigate();
  const term = normalize(query);
  const matches = term ? catalog.filter(item => normalize(item.name).includes(term) || normalize(categoryName(item.category,language)).includes(term)).sort((a,b)=>Number(normalize(b.name).startsWith(term))-Number(normalize(a.name).startsWith(term))).slice(0,8) : [];
  const visible = open && !!term;
  const label = localized(['Search the wiki','Buscar en la wiki','Buscar na wiki'],language);
  return <div className="wiki-global-search" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget)) setOpen(false);}}>
    <label htmlFor={id}>{label}</label>
    <div className="wiki-global-search__input"><Search size={20} aria-hidden="true"/><input id={id} role="combobox" aria-autocomplete="list" aria-expanded={visible} aria-controls={id+'-results'} aria-activedescendant={visible && active >= 0 ? id+'-'+active : undefined} autoComplete="off" value={query} placeholder={localized(['Try MP5, bandage, vehicles…','Prueba MP5, bandage, vehículos…','Experimente MP5, bandage, veículos…'],language)} onFocus={()=>setOpen(true)} onChange={e=>{setQuery(e.target.value);setActive(-1);setOpen(true);}} onKeyDown={e=>{
      if(e.key==='Escape'){setOpen(false);setActive(-1);}
      if(e.key==='ArrowDown'){e.preventDefault();setOpen(true);setActive(i=>Math.min(i+1,matches.length-1));}
      if(e.key==='ArrowUp'){e.preventDefault();setActive(i=>Math.max(0,i-1));}
      if(e.key==='Enter' && visible && matches.length){e.preventDefault();const item=matches[Math.max(0,active)];navigate(itemPath(item.category,item.slug,language));setOpen(false);}
    }}/></div>
    <ul id={id+'-results'} role="listbox" aria-label={label} hidden={!visible} className="wiki-global-search__results">{matches.map((item,i)=><li id={id+'-'+i} role="option" aria-selected={active===i} key={item.category+'/'+item.slug}><Link tabIndex={-1} to={itemPath(item.category,item.slug,language)} onClick={()=>setOpen(false)}>{item.image ? <img src={item.image} alt="" width="44" height="44" loading="lazy"/> : <Search size={20}/>}<span><strong>{item.name}</strong><small>{categoryName(item.category,language)}{item.disambiguator ? ' · '+item.disambiguator : ''}</small></span><ArrowUpRight size={16}/></Link></li>)}</ul>
    {visible && !matches.length && <p role="status" className="wiki-search-empty">{localized(['No matching items.','No hay objetos que coincidan.','Nenhum item encontrado.'],language)}</p>}
  </div>;
}
