import { getMaterialIconHTML, MAP_ICON_MAPPING } from './iconUtils';

export const personalColors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', 
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#3b82f6', 
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', 
    '#f43f5e', '#ffffff', '#94a3b8'
];

export const personalIcons = {
    star: { label: 'Interest', svg: getMaterialIconHTML(MAP_ICON_MAPPING.star) },
    home: { label: 'Base', svg: getMaterialIconHTML(MAP_ICON_MAPPING.home) },
    flag: { label: 'Rally', svg: getMaterialIconHTML(MAP_ICON_MAPPING.flag) },
    map: { label: 'Location', svg: getMaterialIconHTML(MAP_ICON_MAPPING.map) },
    skull: { label: 'Danger', svg: getMaterialIconHTML(MAP_ICON_MAPPING.skull) },
    sword: { label: 'Attack', svg: getMaterialIconHTML(MAP_ICON_MAPPING.sword) },
    shield: { label: 'Defense', svg: getMaterialIconHTML(MAP_ICON_MAPPING.shield) },
    target: { label: 'Target', svg: getMaterialIconHTML(MAP_ICON_MAPPING.target) },
    loot: { label: 'Loot', svg: getMaterialIconHTML(MAP_ICON_MAPPING.loot) },
    car: { label: 'Vehicle', svg: getMaterialIconHTML(MAP_ICON_MAPPING.car) },
    gas: { label: 'Fuel', svg: getMaterialIconHTML(MAP_ICON_MAPPING.gas) },
    medical: { label: 'Meds', svg: getMaterialIconHTML(MAP_ICON_MAPPING.medical) },
    food: { label: 'Food', svg: getMaterialIconHTML(MAP_ICON_MAPPING.food) },
    water: { label: 'Water', svg: getMaterialIconHTML(MAP_ICON_MAPPING.water, { size: 10 }) },
    ammo: { label: 'Ammo', svg: getMaterialIconHTML(MAP_ICON_MAPPING.ammo) },
    chat: { label: 'Note', svg: getMaterialIconHTML(MAP_ICON_MAPPING.chat) }
};

export const mapIcons = {
    person: getMaterialIconHTML(MAP_ICON_MAPPING.person),
    factory: getMaterialIconHTML(MAP_ICON_MAPPING.factory),
    hangar: getMaterialIconHTML(MAP_ICON_MAPPING.hangar),
    bunker_military: getMaterialIconHTML(MAP_ICON_MAPPING.bunker_military),
    bunker_civilian: getMaterialIconHTML(MAP_ICON_MAPPING.bunker_civilian),
    fire: getMaterialIconHTML(MAP_ICON_MAPPING.fire),
    golf: getMaterialIconHTML(MAP_ICON_MAPPING.golf),
    school: getMaterialIconHTML(MAP_ICON_MAPPING.school),
    hospital: getMaterialIconHTML(MAP_ICON_MAPPING.hospital),
    tent: getMaterialIconHTML(MAP_ICON_MAPPING.tent),
    tree: getMaterialIconHTML(MAP_ICON_MAPPING.tree),
    trailer: getMaterialIconHTML(MAP_ICON_MAPPING.trailer),
    key: getMaterialIconHTML(MAP_ICON_MAPPING.key),
    helicopter: getMaterialIconHTML(MAP_ICON_MAPPING.helicopter),
    barracks: getMaterialIconHTML(MAP_ICON_MAPPING.barracks),
    target: getMaterialIconHTML(MAP_ICON_MAPPING.target),
    propane: getMaterialIconHTML(MAP_ICON_MAPPING.propane, { size: 10 }),
    helmet: getMaterialIconHTML(MAP_ICON_MAPPING.helmet),
    gun: getMaterialIconHTML(MAP_ICON_MAPPING.gun),
    
    // Landmarks URLs
    watchtower: 'https://facbshcmgrjexsvpuwgn.supabase.co/storage/v1/object/public/Map/watchtower.png',
    watertower: 'https://facbshcmgrjexsvpuwgn.supabase.co/storage/v1/object/public/Map/watertower.png',
    towercrane: 'https://facbshcmgrjexsvpuwgn.supabase.co/storage/v1/object/public/Map/towercrane.png',
    radiotower: 'https://facbshcmgrjexsvpuwgn.supabase.co/storage/v1/object/public/Map/radio.png',
    huntingtower: 'https://facbshcmgrjexsvpuwgn.supabase.co/storage/v1/object/public/Map/hutning.png',
    cave: 'https://facbshcmgrjexsvpuwgn.supabase.co/storage/v1/object/public/Map/cave.png',
};
