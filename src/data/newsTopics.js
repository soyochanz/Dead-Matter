export const newsTopics = {
  updates: { en: 'Game updates', es: 'Actualizaciones' },
  development: { en: 'Development', es: 'Desarrollo' },
  multiplayer: { en: 'Multiplayer', es: 'Multijugador' },
  community: { en: 'Community', es: 'Comunidad' },
  infected: { en: 'Infected', es: 'Infectados' },
  survival: { en: 'Survival', es: 'Supervivencia' },
  weapons: { en: 'Weapons', es: 'Armas' },
  combat: { en: 'Combat', es: 'Combate' },
  canmore: { en: 'Canmore Hamlet', es: 'Canmore Hamlet' },
  world: { en: 'World & exploration', es: 'Mundo y exploración' },
};

const articleTopics = {
  'development-outlook-october-2026': ['updates', 'development', 'multiplayer'],
  'community-and-development-team': ['community', 'development', 'canmore'],
  'infected-rebuild-preview': ['infected', 'survival', 'multiplayer'],
  'weapons-and-combat-preview': ['weapons', 'combat', 'updates'],
  'canmore-audio-and-survival-preview': ['canmore', 'world', 'survival'],
};

export const tagsFor = article => articleTopics[article.slug] || [];
export const newsPath = (language = 'en', slug = '') => `${language === 'es' ? '/es' : ''}/news${slug ? `/${slug}` : ''}`;
export const newsLanguage = pathname => pathname.startsWith('/es/news') ? 'es' : 'en';

export function relatedNews(article, articles) {
  const tags = tagsFor(article);
  return articles.filter(item => item.slug !== article.slug)
    .map(item => ({ item, score: tagsFor(item).filter(tag => tags.includes(tag)).length }))
    .sort((a, b) => b.score - a.score).slice(0, 2).map(({ item }) => item);
}

export const wikiLinksFor = article => {
  const links = {
    'development-outlook-october-2026': [{ path: '/updates', en: 'Released patch notes', es: 'Notas de parches publicados' }, { path: '/micro-changes', en: 'Development commits', es: 'Commits de desarrollo' }],
    'community-and-development-team': [{ path: '/guides', en: 'Community survival guides', es: 'Guías de supervivencia de la comunidad' }],
    'infected-rebuild-preview': [{ path: '/wiki/meds', en: 'Medicine and survival', es: 'Medicina y supervivencia' }, { path: '/wiki/basebuilding', en: 'Basebuilding guide', es: 'Guía de construcción' }],
    'weapons-and-combat-preview': [{ path: '/wiki/weapons', en: 'Current weapons database', es: 'Base de datos de armas actuales' }],
    'canmore-audio-and-survival-preview': [{ path: '/map', en: 'Interactive Dead Matter map', es: 'Mapa interactivo de Dead Matter' }, { path: '/wiki/vehicles', en: 'Vehicle database', es: 'Base de datos de vehículos' }],
  };
  return links[article.slug] || [];
};
