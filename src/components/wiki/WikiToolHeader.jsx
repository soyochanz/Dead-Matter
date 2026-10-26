import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, HeartPulse, Sparkles } from 'lucide-react';
import { useCoreLanguage } from '@/components/CoreSeo';
import { localized } from '@/lib/wikiCatalog';

export default function WikiToolHeader({ medical = false, children }) {
  const language = useCoreLanguage();
  const Icon = medical ? HeartPulse : Sparkles;
  const title = medical ? ['Medicine & diseases','Medicina y enfermedades','Medicina e doenças'] : ['Perks & occupations','Ventajas y profesiones','Vantagens e profissões'];
  const description = medical ? ['Explore treatments and diseases. Select an entry to see its medical relationships.', 'Explora tratamientos y enfermedades. Selecciona una entrada para ver sus relaciones médicas.', 'Explore tratamentos e doenças. Selecione uma entrada para ver suas relações médicas.'] : ['Build your survivor: choose an occupation, balance perks and save your presets.', 'Crea tu superviviente: elige una profesión, combina ventajas y guarda tus configuraciones.', 'Crie seu sobrevivente: escolha uma profissão, combine vantagens e salve suas configurações.'];
  return <header className="wiki-tool-header">
    <Link className="wiki-back-button" to={language==='en'?'/wiki':`/${language}/wiki`}><ArrowLeft size={16}/>{localized(['Go back','Volver atrás','Voltar'],language)}</Link>
    <p className="wiki-item-eyebrow"><Icon size={16}/> Dead Matter · Wiki</p>
    <h1>{localized(title,language)}</h1>
    <p className="wiki-tool-intro">{localized(description,language)}</p>
    {children}
  </header>;
}
