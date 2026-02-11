// Shared icons between InteractiveMap and MapFilters
// This file centralizes the SVG definitions and color palettes

export const personalColors = [
    '#ef4444', // Red
    '#f97316', // Orange
    '#f59e0b', // Amber
    '#eab308', // Yellow
    '#84cc16', // Lime
    '#22c55e', // Green
    '#10b981', // Emerald
    '#14b8a6', // Teal
    '#06b6d4', // Cyan
    '#3b82f6', // Blue
    '#6366f1', // Indigo
    '#8b5cf6', // Violet
    '#a855f7', // Purple
    '#d946ef', // Fuchsia
    '#ec4899', // Pink
    '#f43f5e', // Rose
    '#ffffff', // White
    '#94a3b8'  // Slate
];

export const personalIcons = {
    // Basics
    star: { label: 'Interest', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>' },
    home: { label: 'Base', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>' },
    flag: { label: 'Rally', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>' },
    map: { label: 'Location', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/></svg>' },

    // Combat
    skull: { label: 'Danger', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="9" r="2"/><circle cx="15" cy="9" r="2"/><path d="M12 2C7.58 2 4 5.58 4 10c0 2.42 1.09 4.6 2.82 6.09L6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2l-.82-2.91C18.91 14.6 20 12.42 20 10c0-4.42-3.58-8-8-8zm-3 8c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm.5 4H8.5v-1h7v1z"/></svg>' },
    sword: { label: 'Attack', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-4H6v-2h4V7h2v4h4v2h-4v4z"/></svg>' },
    shield: { label: 'Defense', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>' },
    target: { label: 'Target', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4-8c0 2.21 1.79 4 4 4s4-1.79 4-4-1.79-4-4-4-4 1.79-4 4z"/></svg>' },

    // Resources
    loot: { label: 'Loot', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z"/></svg>' },
    car: { label: 'Vehicle', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>' },
    gas: { label: 'Fuel', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33a2.5 2.5 0 002.5 2.5c.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77z"/></svg>' },
    medical: { label: 'Meds', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8.5 13h-1v-2.5H7v-1h2.5V10h1v2.5H13v1h-2.5V16z"/></svg>' },
    food: { label: 'Food', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg>' },
    water: { label: 'Water', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z"/></svg>' },

    // Misc
    ammo: { label: 'Ammo', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 2h10v6l-5 5-5-5zM7 22l3.5-12h3l3.5 12z"/></svg>' },
    chat: { label: 'Note', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>' }
};

export const mapIcons = {
    person: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/></svg>',
    factory: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 22H2V10l4-4 4 4V6h4v4l4-4 4 4v12zm-6-5h4v-3H6v3zm8 0h4v-3h-4v3zM18 6V2h-2v4h2z"/></svg>',
    hangar: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 14l-7-5-7 5V21h14V14zm-2 5H7v-3l5-3.5 5 3.5v3z"/></svg>',
    bunker: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-2.18c-1.39-2.36-3.73-4-6.82-4C6 2 2 6 2 11v6h2v5h2v-5h12v5h2v-5h2v-6c0-5-4-9-9-9zm-9 9H9v-2h2v2zm4 0h-2v-2h2v2z"/></svg>',
    fire: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.48 12.35c-1.57-4.08-7.16-4.3-5.81-10.23-1 .63-1.95 1.51-2.58 2.6C9.92 7.2 9 8.66 9 10.56c0 1.05.28 2.03.73 3-.43-.44-.81-.97-1.12-1.55a8.77 8.77 0 01-.6-6.01c-.13.06-.26.13-.39.2-2.3 2.5-1.94 5.95-1.09 8.16.85 2.22 3.1 4.67 5.48 4.67s4.65-2.45 5.5-4.67c.78-2.06.66-4.13-.03-6.01zM12 20c-1.66 0-3-1.34-3-3 0-1.31 1.25-2.5 3-4 1.8 1.5 3 2.69 3 4 0 1.66-1.34 3-3 3z"/></svg>',
    golf: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-3-8c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-3 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-4-4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm8 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>',
    school: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>',
    hospital: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>',
    tent: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 17h20v2H2v-2zm10-15L2 15h20L12 2zm0 3.3L18.4 14H5.6L12 5.3z"/></svg>',
    tree: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22h20L12 2zm0 3.5L18.5 20H5.5L12 5.5z"/></svg>',
    trailer: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 7h-8v8h8V7zm2-2h-8c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zM7 11H4v4h3v-4zm-3 6h3c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1z"/></svg>',
    key: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 10h-8.35C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H13v2h2v-2h2v2h2v-2h2v-4zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>',
    car: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>',
    helicopter: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 15.5l-2.2-3.3C19.2 11.3 18 10.6 16.7 10.3C16.3 8.4 14.6 7 12.5 7h-2C9.5 7 7.1 8.3 5.6 10.3L3.8 11L2 13.7v2.8h1v-1.7h18v1.7h1V15.5H22z M10,13.7H3l1.5-2.2c1.3-1.8,3.3-2.9,5.5-2.9C10 10.6,10,13.7,10,13.7z M18.5,13.7h-4V10c0,0,0,0,0,0c0.8,0.1,1.5,0.3,2.2,0.7L18.5,13.7z M13.8,2h-3L10,5h4L13.8,2z M21,5h-5.2l0.8,2H21V5z M2.2,5h5.2L6.6,7H2.2V5z"/></svg>',
    barracks: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v16h2v-2h16v2h2V4c0-1.1-.9-2-2-2zM4 4h16v12H4V4zm4 4h8v2H8V8z"/></svg>',
    target: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4-8c0 2.21 1.79 4 4 4s4-1.79 4-4-1.79-4-4-4-4 1.79-4 4z"/></svg>',
    propane: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 6h-1V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v1h-1c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 5h4v1h-4V5zm-3 7h10v3H7v-3z"/></svg>',
    helmet: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-4.42 0-8 3.58-8 8v4h2v-1h2v1h8v-1h2v1h2v-4c0-4.42-3.58-8-8-8zm0 2c3.31 0 6 2.69 6 6h-2c0-2.21-1.79-4-4-4s-4 1.79-4 4H6c0-3.31 2.69-6 6-6z"/></svg>',
    gun: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm12 0h-2v2h2V9zm6-4h-2v2h2V5zm-6 12h-2v2h2v-2zm-6-4h2v2H9v-2zm-6 4h2v2H3v-2zm12-4h-2v2h2v-2zm2-7.5V5h-2.5V3h-2v2H5v14h14v-9.5h2v-2h-3z"/></svg>',
    // Landmarks
    watchtower: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22h20"/><path d="M10 22v-4a2 2 0 0 1 4 0v4"/><path d="M4 18h16"/><path d="M6 18v-4a2 2 0 0 1 4 0"/><path d="M14 14a2 2 0 0 1 4 0v4"/><path d="M8 10h8"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/><path d="M12 2v1"/></svg>',
    watertower: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6Z"/><path d="M9 12v10"/><path d="M15 12v10"/><path d="M6 22h12"/><path d="M12 12v10"/></svg>',
    towercrane: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 22h18"/><path d="M5 22V2"/><path d="m13 6-8 3"/><path d="m20 9-13 4"/><path d="m17 12-4 3"/><path d="m5 2 16 7"/></svg>',
    radiotower: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22h20"/><path d="M5 22 12 2l7 20"/><path d="M9 12h6"/><path d="M12 12v5"/><path d="M12 7v2"/><circle cx="12" cy="2" r="1"/></svg>',
    huntingtower: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16"/><path d="M6 22V10h12v12"/><path d="M12 10V2"/><path d="M8 6h8"/><path d="m5 10 7-7 7 7"/></svg>',
    cave: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18v-7a9 9 0 0 0-18 0v7Z"/><path d="M21 14a2 2 0 0 0-2-2h-3a2 2 0 0 0-2 2v7"/><path d="M11 21v-3a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"/></svg>',
};
