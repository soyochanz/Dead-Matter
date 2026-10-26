import { crowdfundingNews } from './crowdfundingNews.js';
// Editorial summaries. Source dates are separate from publication dates;
// announced work must not be presented as a released patch.
const general = 'https://discord.com/channels/268929973882978308/337281364921679882/';
const sneak = 'https://discord.com/channels/268929973882978308/1202363220585881680/';

export const news = [
  crowdfundingNews,
  {
    slug: 'development-outlook-october-2026', category: 'development', date: '2026-10-26', sourceDate: '2026-10-23',
    title: { en: 'A playable build in 2026? What Johnny actually said', es: '¿Una build jugable en 2026? Lo que dijo Johnny' },
    summary: { en: 'The developer still expects a playable build this year, but there is no release date or confirmed stability target.', es: 'El desarrollador sigue esperando una build jugable este año, pero no hay fecha de lanzamiento ni estabilidad confirmada.' },
    body: {
      en: [
        'On October 23, Johnny Guitar answered affirmatively when asked whether a playable build was expected this year and whether he was confident about it. That is a development expectation, not a dated release announcement: the message does not specify a distribution branch or how stable the build will be.',
        'There is reason to keep expectations measured. September previews referred to multiplayer builds in the following days, while on October 12 Johnny was still discussing the integration of interchangeable clothing and hair with the updated characters.',
        'For players deciding when to return, the useful milestone is a build they can actually test. The available messages do not establish when a stable multiplayer release will arrive. This report reflects sources checked on October 23; it does not announce that the update has shipped.'
      ],
      es: [
        'El 23 de octubre, Johnny Guitar respondió afirmativamente a la pregunta de si esperaban una build jugable este año y si confiaba en conseguirlo. Es una expectativa del desarrollador: el mensaje no concreta un día, una rama de distribución ni el nivel de estabilidad.',
        'Hay motivos para mantener la cautela. Los adelantos de septiembre hablaban de builds multijugador en los días siguientes, mientras que el 12 de octubre Johnny todavía explicaba dificultades para integrar ropa y pelo intercambiables con los personajes actualizados.',
        'Para quien se plantea volver, el hito relevante será una build que se pueda probar. Los mensajes no permiten fechar una versión estable con multijugador sólido. Este artículo recoge las fuentes revisadas el 23 de octubre; no anuncia que la actualización ya se haya publicado.'
      ]
    },
    sources: [{ label: 'Johnny Guitar · October 23', url: general + '1562920030398709842' }, { label: 'Character integration · October 12', url: general + '1559006653054189630' }]
  },
  {
    slug: 'community-and-development-team', category: 'community', date: '2026-10-26', sourceDate: '2026-10-22',
    title: { en: 'A smaller team behind the long wait', es: 'Un equipo más pequeño detrás de la larga espera' },
    summary: { en: 'Developer messages explain the reduced capacity, while the community waits for a build that demonstrates the progress.', es: 'Los mensajes de los desarrolladores explican la capacidad reducida mientras la comunidad espera poder comprobar los avances.' },
    body: {
      en: [
        'In July 2024, Johnny Guitar described going from a programming team to being the only programmer while dealing with technical debt. In January 2025, he described the game as being developed primarily by two people. These are dated descriptions of capacity, not a complete current staff list.',
        'Vitka has documented work on Canmore Hamlet, including interiors, apartments and the golf course. A May 2025 estimate of 97% completion referred to that area, not the whole game or the entire upcoming update.',
        'Johnny again acknowledged reduced capacity on October 22, 2026. The practical question for the community is when the documented work becomes playable. We will keep developer announcements, technical commits and released patch notes separate so readers can follow that distinction.'
      ],
      es: [
        'En julio de 2024, Johnny Guitar explicó que había pasado de tener un equipo de programación a ser el único programador, además de afrontar deuda técnica. En enero de 2025 describió el desarrollo como un trabajo realizado principalmente por dos personas. Son declaraciones fechadas sobre su capacidad, no un listado completo y actual de personal.',
        'Vitka ha documentado trabajo en Canmore Hamlet, incluidos interiores, apartamentos y el campo de golf. Su estimación del 97 % en mayo de 2025 se refería a esa zona, no al juego entero ni a toda la actualización.',
        'El 22 de octubre de 2026, Johnny volvió a reconocer que trabajan con capacidad reducida. Para la comunidad, la pregunta práctica sigue siendo cuándo se podrá jugar a lo mostrado. Separaremos anuncios, commits técnicos y notas de parches publicados para que esa diferencia sea clara.'
      ]
    },
    sources: [{ label: 'Programming team · July 2024', url: general + '1263386799150207036' }, { label: 'Team capacity · January 2025', url: general + '1332061961046986803' }, { label: 'Vitka · Canmore Hamlet', url: general + '1367762266690158673' }, { label: 'Johnny Guitar · October 22', url: general + '1562840033688428675' }]
  },
  {
    slug: 'infected-rebuild-preview', category: 'game', date: '2026-10-26', sourceDate: '2026-09-13',
    title: { en: 'The infected rebuild: appearance, combat and spawning', es: 'La reconstrucción de los infectados: aspecto, combate y aparición' },
    summary: { en: 'September previews describe varied infected, breakable doors and different spawning rules for solo and multiplayer.', es: 'Los adelantos de septiembre describen infectados variados, puertas que pueden romperse y reglas distintas para solitario y multijugador.' },
    body: {
      en: [
        'Johnny’s September 13 preview describes a rebuilt infected system: more detailed models, hair and facial hair, different heights and body types, varied animations and revised navigation.',
        'The announced behaviours include attacking and breaking doors, melee pushes to create distance, dismemberment and visible damage. Some infected are described as wearing protective vests; some military infected can run.',
        'The described solo configuration uses an initial random population that persists without normal respawning or despawning. Multiplayer is intended to spawn infected more aggressively, with claimed buildings limiting nearby spawns. Swapping these configurations is described as a future possibility.',
        'These are announced features, not a hands-on verdict or confirmation that they are available in the public release. Their combined behaviour still needs to be assessed in the shipped build.'
      ],
      es: [
        'El adelanto de Johnny del 13 de septiembre describe un sistema de infectados reconstruido: modelos más detallados, pelo y vello facial, alturas y complexiones diferentes, animaciones variadas y navegación revisada.',
        'Entre los comportamientos anunciados están atacar y romper puertas, los empujones cuerpo a cuerpo para ganar distancia, desmembramientos y daño visual. También se mencionan infectados con chalecos de protección y algunos militares capaces de correr.',
        'La configuración descrita para solitario utiliza una población inicial aleatoria y persistente, sin reaparición o desaparición habitual. En multijugador se plantea una aparición más agresiva; reclamar edificios limita las apariciones cercanas. Intercambiar estas configuraciones se menciona como posibilidad futura.',
        'Son características anunciadas, no una valoración tras probarlas ni una confirmación de que estén en la versión pública. Su funcionamiento conjunto deberá comprobarse en la build que se publique.'
      ]
    },
    sources: [{ label: 'Infected models and systems', url: sneak + '1548706812574965951' }, { label: 'Behaviour and spawning rules', url: sneak + '1548706817092231350' }]
  },
  {
    slug: 'weapons-and-combat-preview', category: 'game', date: '2026-10-26', sourceDate: '2026-09-21',
    title: { en: 'Returning weapons, new additions and revised gunplay', es: 'Armas que regresan, nuevas incorporaciones y combate revisado' },
    summary: { en: 'FiveSeven, MP7, AKs and G18 return in the announced arsenal, alongside G3, FAL, SKS and the GR26 preview.', es: 'FiveSeven, MP7, AK y G18 regresan al arsenal anunciado, junto a incorporaciones como G3, FAL, SKS y el adelanto de la GR26.' },
    body: {
      en: [
        'The September arsenal overview separates returning alpha weapons from new additions. FiveSeven, MP7, the AK family and G18 are described as reintroduced; G3, M9, C1A1/FAL, SKS, the single-shot Henry shotgun and a bow with arrows are presented as additions.',
        'A September 21 preview also shows the GR26, including a variant described as having less recoil. The accompanying combat plans include smoother reloads while aiming, improved animation blending while moving and recoil intended to recover some of the alpha’s feel.',
        'The previews document work in development. They do not establish final weapon balance, exact release timing or availability in the current public build.'
      ],
      es: [
        'El resumen del arsenal de septiembre distingue las armas recuperadas de la alpha de las incorporaciones nuevas. FiveSeven, MP7, la familia AK y G18 se describen como reintroducidas; G3, M9, C1A1/FAL, SKS, la escopeta Henry de un disparo y un arco con flechas aparecen como incorporaciones.',
        'El adelanto del 21 de septiembre también muestra la GR26, incluida una variante descrita con menor retroceso. Los planes de combate incluyen recargas más suaves al apuntar, mejores transiciones de animación en movimiento y un retroceso que busca recuperar sensaciones de la alpha.',
        'Los adelantos documentan trabajo en desarrollo. No confirman el equilibrio final de las armas, una fecha exacta de lanzamiento ni su disponibilidad en la build pública actual.'
      ]
    },
    sources: [{ label: 'Arsenal and combat overview', url: sneak + '1548706865569857569' }, { label: 'GR26 preview · September 21', url: sneak + '1551325508963278940' }]
  },
  {
    slug: 'canmore-audio-and-survival-preview', category: 'game', date: '2026-10-26', sourceDate: '2026-09-13',
    title: { en: 'Canmore, sound and the survival systems being revised', es: 'Canmore, sonido y los sistemas de supervivencia en revisión' },
    summary: { en: 'A more developed town, revised environmental audio, inventory improvements and medical and vehicle work feature in the preview.', es: 'Una localidad más trabajada, audio ambiental revisado, mejoras de inventario y trabajo en medicina y vehículos protagonizan el adelanto.' },
    body: {
      en: [
        'The September overview describes a more developed Canmore Hamlet, alongside waterfalls, rockslides, improved trails and more open sightlines. These changes concern exploration as well as the appearance of the world.',
        'The audio plans include gunshots audible at distance to players and infected, synchronised footsteps, indoor and outdoor ambience and revised reverberation.',
        'Character and inventory work includes a returning survivor preview, revised icons and quantities, more clothing and options such as a chest-slot bag. The overview also describes a new medical system and first-person driving animations.',
        'This article summarises announced development work. The preview alone does not show that all of these systems are integrated, stable or released together.'
      ],
      es: [
        'El resumen de septiembre describe un Canmore Hamlet más desarrollado, además de cascadas, desprendimientos, senderos mejorados y líneas de visión más abiertas. Los cambios afectan a la exploración y al aspecto del mundo.',
        'Los planes de audio incluyen disparos audibles a distancia para jugadores e infectados, pasos sincronizados, ambientes interiores y exteriores y reverberación revisada.',
        'El trabajo en personajes e inventario incluye el regreso de la previsualización del superviviente, iconos y cantidades revisados, más ropa y opciones como una bolsa en la ranura del pecho. También se describe un nuevo sistema médico y animaciones de conducción en primera persona.',
        'Este artículo resume trabajo anunciado. El adelanto por sí solo no demuestra que todos estos sistemas estén integrados, sean estables o se hayan publicado juntos.'
      ]
    },
    sources: [{ label: 'Audio and world', url: sneak + '1548706841977028710' }, { label: 'Inventory and characters', url: sneak + '1548706888257110117' }, { label: 'Medical, vehicles and Canmore', url: sneak + '1548706907609501729' }]
  }
];

export const localizeNews = (value, language) => value[language?.split('-')[0]] || value.en;
