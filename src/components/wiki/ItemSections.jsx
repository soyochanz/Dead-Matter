import React from 'react';
import { Gauge, Heart, Droplets, Zap, Users, Fuel, Package, Shield, Coins, MapPin, Wrench, Flame, Crosshair, Layers, Utensils, AlertTriangle, Box } from 'lucide-react';
import { fieldName, fieldValue, localized } from '@/lib/wikiCatalog';

const icons = { speed: Gauge, driving_handling: Gauge, health: Heart, hydration: Droplets, energy: Zap, occupants: Users, fuel_capacity: Fuel, inventory_slots: Package, capacity: Package, armor_value: Shield, price: Coins, sell_price: Coins, spawn_locations: MapPin, location: MapPin, doors: MapPin, damage: Crosshair, accuracy: Crosshair, rate_of_fire: Zap, weight: Package, requires_can_opener: Wrench, is_safe_to_eat_raw: Shield };
export function StatIcon({ field }) { const Icon = icons[field] || Layers; return <Icon size={15} aria-hidden="true"/>; }
export const sectionIcons = { components: Wrench, cooked: Flame, materials: Package, recipes: Wrench, sellers: Coins, inventory: Package, ammo: Crosshair, attachments: Wrench, compatible: Layers, treats: Heart, treatments: Heart };
const groups = {
  vehicles: [ [['Vehicle specifications','Especificaciones del vehículo','Especificações do veículo'], Gauge, ['speed','occupants','fuel_capacity','inventory_slots','health','capacity','use_case','driving_handling']] ],
  consumables: [ [['Nutrition & effects','Nutrición y efectos','Nutrição e efeitos'], Utensils, ['hydration','energy','health']], [['Preparation & safety','Preparación y seguridad','Preparo e segurança'], Flame, ['type','is_safe_to_eat_raw','requires_can_opener','is_refillable']] ],
  weapons: [ [['Weapon performance','Rendimiento del arma','Desempenho da arma'], Crosshair, ['ammo','damage','accuracy','rate_of_fire','capacity','handling','melee_range','attack_speed','stamina_efficiency','weight','size']] ],
  gear: [ [['Protection & storage','Protección y almacenamiento','Proteção e armazenamento'], Shield, ['armor_value','armor_rating','inventory_slots','slots','weight','insulation','bleed_protection','blunt_protection','fire_protection']] ],
  keys: [ [['Access & locations','Acceso y ubicaciones','Acesso e locais'], MapPin, ['doors','spawn_locations','location']] ],
  toolbelts: [ [['Utility & storage','Utilidad y almacenamiento','Utilidade e armazenamento'], Wrench, ['use_function','inventory_slots','size','weight']] ],
  basebuilding: [ [['Construction details','Datos de construcción','Dados de construção'], Wrench, ['health','slots','use']] ]
};
export default function ItemSections({ item, language }) {
  const used = new Set();
  const sections = [...(groups[item.category] || []), [['Trading','Comercio','Comércio'],Coins,['price','sell_price']]];
  const remaining = Object.keys(item.attributes).filter(key => !sections.some(([, ,keys])=>keys.includes(key)));
  sections.push([['Item details','Datos del objeto','Dados do item'],Layers,remaining]);
  return <>{sections.map(([title,Icon,keys])=>{
    const fields=keys.filter(key=>Object.hasOwn(item.attributes,key) && !used.has(key)); fields.forEach(key=>used.add(key));
    return fields.length ? <section className="wiki-specific-section" key={title[0]}><h3><Icon size={17} aria-hidden="true"/>{localized(title,language)}</h3><dl className="wiki-item-stat-list">{fields.map(key=><div key={key}><dt><StatIcon field={key}/>{fieldName(key,language)}</dt><dd>{fieldValue(item.attributes[key],language)}</dd></div>)}</dl></section> : null;
  })}</>;
}
export function ExtraItemSections({ item, language }) {
  const details=item.details || {};
  return <>
    {details.performance?.length > 0 && <section className="wiki-specific-panel"><h2><Gauge size={20}/>{localized(['Performance','Rendimiento','Desempenho'],language)}</h2><div className="wiki-performance-grid">{details.performance.map((stat,i)=><div key={i}><div className="wiki-performance-label"><span>{stat.label}</span><strong>{stat.value}{stat.max > 0 ? ` / ${stat.max}` : ''}</strong></div>{stat.max > 0 && <progress max={stat.max} value={Math.max(0,Math.min(stat.value,stat.max))} aria-label={stat.label}/>}</div>)}</div></section>}
    {Object.keys(details.sideEffects || {}).length > 0 && <section className="wiki-specific-panel"><h2><AlertTriangle size={20}/>{localized(['Side effects','Efectos secundarios','Efeitos colaterais'],language)}</h2><dl className="wiki-item-stat-list">{Object.entries(details.sideEffects).map(([key,value])=><div key={key}><dt>{key}</dt><dd>{fieldValue(value,language)}</dd></div>)}</dl></section>}
    {details.image_unpacked_url && <section className="wiki-specific-panel"><h2><Box size={20}/>{localized(['Unpacked appearance','Aspecto desplegado','Aparência montada'],language)}</h2><img className="wiki-unpacked-image" src={details.image_unpacked_url} alt={item.name} width="480" height="320" loading="lazy" decoding="async"/></section>}
    {details.audio_url && <section className="wiki-specific-panel"><h2><Zap size={20}/>{localized(['Item sound','Sonido del objeto','Som do item'],language)}</h2><audio controls preload="none" src={details.audio_url} aria-label={item.name}/></section>}
  </>;
}
