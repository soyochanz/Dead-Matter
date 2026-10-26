export const languages = ['en', 'es', 'pt'];
export const corePath = (language, page = '') => `${language === 'en' ? '' : `/${language}`}${page ? `/${page}` : language === 'en' ? '/' : ''}`;
export const coreLanguage = pathname => /^\/(es|pt)(?:\/|$)/.exec(pathname)?.[1] || 'en';
export const isCorePath = pathname => /^\/(?:(?:es|pt)(?:\/(?:wiki|dead-matter-game))?|wiki|dead-matter-game)?\/?$/.test(pathname);
export const gameGuide = {
  en: {
    homeTitle: 'Dead Matter Wiki — Map, Weapons, Guides & Game News',
    homeDescription: 'Explore the Dead Matter community wiki: interactive map, weapons, gear, vehicles, survival guides, patch notes and sourced development news.',
    wikiTitle: 'Dead Matter Wiki Database — Weapons, Items & Vehicles',
    wikiDescription: 'Browse Dead Matter weapons, equipment, food, medicine, keys, vehicles and perks. Find item categories and guides in the community wiki.',
    title: 'Dead Matter Game — Overview, Release & Beginner Resources',
    description: 'What is Dead Matter? Learn about the PC survival game, its Early Access release and where to find maps, items, patch notes and development news.',
    heading: 'Dead Matter: the game',
    intro: 'Dead Matter is a survival game by QI Games, set in the Canadian Rockies. Its Steam Early Access release was September 15, 2023, for Windows PC.',
    label: 'Community field guide', home: 'Home', wiki: 'Item database', guide: 'Game overview', reviewed: 'Reviewed October 26, 2026',
    resourcesTitle: 'Find your next answer',
    resources: [
      ['map', 'Dead Matter interactive map', 'Explore locations and points of interest before planning a route. Cross-check locations against the build you play.'],
      ['wiki/weapons', 'Weapons and equipment', 'Browse weapon entries, then compare gear and toolbelts. Start with the item name when looking for a specific loadout.'],
      ['wiki/consumables', 'Food, medicine and survival', 'Use the consumables and medical categories to look up supplies. Community guides add context beyond an individual item entry.'],
      ['wiki/vehicles', 'Vehicles, keys and exploration', 'Find vehicle entries and browse the keys category when researching access to locations.'],
      ['guides', 'Community survival guides', 'Read player-written guides alongside the item database. Check dates and versions before applying advice to a different build.'],
      ['news', 'Development news and patch notes', 'News explains sourced development previews. Patch notes record releases; the commits feed records individual development changes.']
    ],
    faqTitle: 'Before you start',
    faq: [
      ['Is this the official Dead Matter website?', 'No. This is an independent community wiki. Use the official Steam listing for purchase information and the developer’s Steam announcements for release information.'],
      ['Does a development preview mean a feature is playable?', 'No. A preview or commit is evidence of work, not confirmation that it is included in your build. Compare the dated source with released patch notes.'],
      ['Where should a new player begin?', 'Start with the map, then look up equipment in the wiki and read a community guide. Keep your game version in mind: older guides can describe different mechanics.'],
      ['Is the wiki available in other languages?', 'The homepage, item directory and this overview have English, Spanish and Portuguese versions. News is available in English and Spanish. Individual community entries may have different translation coverage; wiki languages do not imply game language support.']
    ],
    sources: 'Official sources and version context',
    sourceNote: 'The store currently labels the game Early Access and warns that its development timeline may be outdated. Consult the live listing and dated announcements before relying on a release plan.',
    steam: 'Official Steam listing', announcements: 'Developer announcements', patches: 'Released patch notes', commits: 'Development commits'
  },
  es: {
    homeTitle: 'Dead Matter Wiki en español — Mapa, Armas y Guías',
    homeDescription: 'Consulta la wiki de Dead Matter: mapa interactivo, armas, equipo, vehículos, guías de supervivencia y noticias del desarrollo con fuentes.',
    wikiTitle: 'Wiki de Dead Matter — Armas, Objetos y Vehículos',
    wikiDescription: 'Explora las categorías de armas, equipo, comida, medicina, llaves, vehículos y ventajas de Dead Matter en la wiki de la comunidad.',
    title: 'Dead Matter: el juego — Lanzamiento y Guía para Empezar',
    description: 'Qué es Dead Matter, cuándo salió en acceso anticipado y dónde consultar mapas, objetos, guías, actualizaciones y noticias de desarrollo.',
    heading: 'Dead Matter: el juego',
    intro: 'Dead Matter es un juego de supervivencia de QI Games ambientado en las Montañas Rocosas de Canadá. Se lanzó en acceso anticipado en Steam el 15 de septiembre de 2023 para PC Windows.',
    label: 'Guía de la comunidad', home: 'Inicio', wiki: 'Base de datos de objetos', guide: 'Información del juego', reviewed: 'Revisado el 26 de octubre de 2026',
    resourcesTitle: 'Encuentra la respuesta que necesitas',
    resources: [
      ['map', 'Mapa interactivo de Dead Matter', 'Explora ubicaciones y puntos de interés antes de planificar tu ruta. Contrasta las ubicaciones con la versión que juegas.'],
      ['wiki/weapons', 'Armas y equipamiento', 'Consulta las fichas de armas y compara equipo y cinturones de herramientas. Busca por el nombre del objeto para preparar tu equipamiento.'],
      ['wiki/consumables', 'Comida, medicina y supervivencia', 'Consulta las categorías de consumibles y medicina para conocer los suministros. Las guías añaden contexto a las fichas individuales.'],
      ['wiki/vehicles', 'Vehículos, llaves y exploración', 'Busca fichas de vehículos y consulta las llaves cuando investigues el acceso a una ubicación.'],
      ['guides', 'Guías de supervivencia de la comunidad', 'Combina las guías de jugadores con la base de datos. Comprueba fechas y versiones antes de aplicar consejos a otra compilación.'],
      ['news', 'Noticias del desarrollo y actualizaciones', 'News explica avances con fuentes. Las notas de parche documentan lanzamientos; el historial de commits recoge cambios individuales del desarrollo.']
    ],
    faqTitle: 'Antes de empezar',
    faq: [
      ['¿Es esta la web oficial de Dead Matter?', 'No. Es una wiki independiente de la comunidad. Consulta la ficha oficial de Steam para información de compra y los anuncios del desarrollador para los lanzamientos.'],
      ['¿Un avance del desarrollo confirma que una función ya se puede jugar?', 'No. Un avance o commit documenta trabajo, pero no confirma que esté incluido en tu versión. Compara su fecha y fuente con las notas de los parches publicados.'],
      ['¿Por dónde empiezo si soy nuevo?', 'Empieza por el mapa, consulta el equipamiento en la wiki y lee una guía de la comunidad. Ten presente tu versión: una guía antigua puede describir mecánicas diferentes.'],
      ['¿Qué partes de la wiki están traducidas?', 'La portada, el directorio de objetos y esta guía tienen versiones en inglés, español y portugués. News está en inglés y español. La traducción de las fichas individuales puede variar; los idiomas de la wiki no indican los idiomas del juego.']
    ],
    sources: 'Fuentes oficiales y contexto de versiones',
    sourceNote: 'La tienda identifica el juego como acceso anticipado y advierte que el calendario de desarrollo puede estar desactualizado. Consulta la ficha actual y los anuncios fechados antes de confiar en un plan de lanzamiento.',
    steam: 'Ficha oficial de Steam', announcements: 'Anuncios del desarrollador', patches: 'Notas de parches publicados', commits: 'Commits del desarrollo'
  },
  pt: {
    homeTitle: 'Dead Matter Wiki em português — Mapa, Armas e Guias',
    homeDescription: 'Explore a wiki de Dead Matter: mapa interativo, armas, equipamentos, veículos, guias de sobrevivência e notícias de desenvolvimento com fontes.',
    wikiTitle: 'Wiki de Dead Matter — Armas, Itens e Veículos',
    wikiDescription: 'Consulte categorias de armas, equipamentos, comida, remédios, chaves, veículos e vantagens de Dead Matter na wiki da comunidade.',
    title: 'Dead Matter: o jogo — Lançamento e Guia para Iniciantes',
    description: 'O que é Dead Matter? Conheça o jogo de sobrevivência para PC, seu acesso antecipado e onde encontrar mapas, itens, atualizações e notícias.',
    heading: 'Dead Matter: o jogo',
    intro: 'Dead Matter é um jogo de sobrevivência da QI Games ambientado nas Montanhas Rochosas do Canadá. Foi lançado em acesso antecipado no Steam em 15 de setembro de 2023 para Windows PC.',
    label: 'Guia da comunidade', home: 'Início', wiki: 'Banco de dados de itens', guide: 'Sobre o jogo', reviewed: 'Revisado em 26 de outubro de 2026',
    resourcesTitle: 'Encontre a resposta que procura',
    resources: [
      ['map', 'Mapa interativo de Dead Matter', 'Explore locais e pontos de interesse antes de planejar uma rota. Confira os locais de acordo com a versão que você joga.'],
      ['wiki/weapons', 'Armas e equipamentos', 'Consulte as fichas de armas e compare equipamentos e cintos de ferramentas. Use o nome do item para pesquisar uma configuração específica.'],
      ['wiki/consumables', 'Comida, remédios e sobrevivência', 'Consulte consumíveis e a categoria médica para pesquisar suprimentos. Os guias acrescentam contexto às fichas individuais.'],
      ['wiki/vehicles', 'Veículos, chaves e exploração', 'Pesquise veículos e consulte a categoria de chaves ao investigar o acesso a um local.'],
      ['guides', 'Guias de sobrevivência da comunidade', 'Combine guias de jogadores com o banco de dados. Confira datas e versões antes de aplicar dicas a uma compilação diferente.'],
      ['news', 'Notícias e atualizações', 'News explica prévias com fontes. As notas de atualização documentam lançamentos; o histórico de commits registra mudanças individuais do desenvolvimento.']
    ],
    faqTitle: 'Antes de começar',
    faq: [
      ['Este é o site oficial de Dead Matter?', 'Não. Esta é uma wiki independente da comunidade. Consulte a página oficial no Steam para informações de compra e os anúncios do desenvolvedor para lançamentos.'],
      ['Uma prévia significa que o recurso já está disponível?', 'Não. Uma prévia ou commit demonstra trabalho, mas não confirma sua inclusão na versão que você joga. Compare a fonte e sua data com as notas de atualizações lançadas.'],
      ['Por onde um iniciante deve começar?', 'Comece pelo mapa, consulte equipamentos na wiki e leia um guia da comunidade. Considere a versão do jogo: guias antigos podem descrever mecânicas diferentes.'],
      ['Quais partes da wiki têm tradução?', 'A página inicial, o diretório de itens e este guia têm versões em inglês, espanhol e português. News está em inglês e espanhol. A tradução de entradas individuais pode variar; os idiomas da wiki não representam o suporte de idiomas do jogo.']
    ],
    sources: 'Fontes oficiais e contexto das versões',
    sourceNote: 'A loja identifica o jogo como acesso antecipado e alerta que o cronograma de desenvolvimento pode estar desatualizado. Consulte a página atual e anúncios datados antes de confiar em um plano de lançamento.',
    steam: 'Página oficial no Steam', announcements: 'Anúncios do desenvolvedor', patches: 'Notas de atualizações lançadas', commits: 'Commits de desenvolvimento'
  }
};
