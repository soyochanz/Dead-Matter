import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, LockKeyhole } from 'lucide-react';
import './CategoryTile.css';

export const categoryAccents = {
  weapons: '#fb7185', vehicles: '#60a5fa', gear: '#34d399', basebuilding: '#fb923c',
  consumables: '#facc15', meds: '#f472b6', medical: '#f472b6', npcs: '#c084fc',
  keys: '#a5b4fc', toolbelts: '#67e8f9', perks: '#a78bfa', accessories: '#2dd4bf'
};

export default function CategoryTile({ title, icon: Icon, to, category, description, status, action, compact = false, disabled = false }) {
  const content = <>
    <div className="category-tile__top">
      <span className="category-tile__icon"><Icon size={compact ? 23 : 28} strokeWidth={1.7} /></span>
      <span className="category-tile__arrow" aria-hidden="true">{disabled ? <LockKeyhole size={15} /> : <ArrowUpRight size={18} />}</span>
    </div>
    <div className="category-tile__body">
      <h3>{title}</h3>
      {!compact && <p>{description}</p>}
    </div>
    {!compact && <div className="category-tile__footer"><span className="category-tile__status"><i aria-hidden="true" />{status}</span>{!disabled && <span className="category-tile__action">{action}</span>}</div>}
  </>;
  const props = { className: `category-tile ${compact ? 'category-tile--compact' : ''} ${disabled ? 'category-tile--disabled' : ''}`, style: { '--category-accent': categoryAccents[category.toLowerCase()] || '#94a3b8' } };
  return disabled ? <div {...props} aria-disabled="true">{content}</div> : <Link {...props} to={to}>{content}</Link>;
}
