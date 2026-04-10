import React from 'react';

/**
 * Returns a Material Symbol Rounded span as an HTML string.
 * Used for Leaflet markers which require raw HTML strings.
 */
export const getMaterialIconHTML = (iconName, { size = 14, color = 'currentColor', fill = 1 } = {}) => {
    // We use a comprehensive style to ensure the font behaves as an icon even if global CSS is slow.
    return `<span class="material-symbols-rounded" style="
        font-family: 'Material Symbols Rounded';
        font-weight: normal;
        font-style: normal;
        font-size: ${size}px;
        line-height: 1;
        letter-spacing: normal;
        text-transform: none;
        display: flex;
        align-items: center;
        justify-content: center;
        white-space: nowrap;
        word-wrap: normal;
        direction: ltr;
        -webkit-font-feature-settings: 'liga';
        -webkit-font-smoothing: antialiased;
        color: ${color};
        font-variation-settings: 'FILL' ${fill}, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        width: 100%;
        height: 100%;
        user-select: none;
    ">${iconName}</span>`;
};

/**
 * Mapping of internal keys → Material Symbols Rounded icon names.
 *
 * All names have been verified to exist in the Material Symbols library.
 */
export const MAP_ICON_MAPPING = {
    // --- Personal icons ---
    star: 'star',                  // Interest
    home: 'home',                  // Base
    flag: 'flag',                  // Rally point
    map: 'location_on',            // Location pin
    skull: 'dangerous',            // Danger
    sword: 'crisis_alert',         // Attack
    shield: 'shield',              // Defense
    target: 'gps_fixed',           // Target
    loot: 'inventory_2',           // Loot box
    car: 'directions_car',         // Vehicle
    gas: 'local_gas_station',      // Fuel
    medical: 'medical_services',   // Meds
    food: 'restaurant',            // Food
    water: 'water_drop',           // Water
    ammo: 'bolt',                  // Ammo
    chat: 'chat',                  // Note

    // --- Map POI icons ---
    person: 'sensor_occupied',       // NPC / Person
    factory: 'factory',               // Factory
    hangar: 'warehouse',             // Hangar
    bunker_military: 'gate',         // Military bunker
    bunker_civilian: 'gate',         // Civilian bunker
    fire: 'local_fire_department', // Fire station
    golf: 'sports_golf',           // Golf course
    school: 'school',                // School / university
    hospital: 'local_hospital',        // Hospital
    tent: 'camping',               // Tent
    tree: 'park',                  // Forest / nature
    trailer: 'rv_hookup',             // Trailer park
    key: 'key',                   // Key / locked
    helicopter: 'helicopter',            // Helicopter / helicrash
    barracks: 'warehouse',            // Barracks / building
    propane: 'propane_tank',          // Propane / butane
    helmet: 'construction',          // Helmet / military base
    gun: 'gps_fixed',             // Weapon

    // --- Vehicles (extended) ---
    vehicle_car: 'directions_car',
    vehicle_truck: 'local_shipping',
    vehicle_bus: 'directions_bus',
    vehicle_suv: 'directions_car',
    trailer_camper: 'rv_hookup',
    trailer_flatbed: 'rv_hookup',
    trailer_box: 'inventory_2',
};