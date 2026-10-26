import fs from 'node:fs/promises';
import { slugify } from '../src/utils/slugify.js';

// Public catalogue only. Never use an administrative/service-role credential here.
const client = await fs.readFile('src/lib/mySupabaseClient.js', 'utf8');
const base = process.env.VITE_SUPABASE_URL || client.match(/const supabaseUrl = .*?\|\| '([^']+)'/)[1];
const key = process.env.VITE_SUPABASE_ANON_KEY || client.match(/const supabaseAnonKey = .*?\|\| '([^']+)'/)[1];
if (key.startsWith('sb_secret_')) throw new Error('Only a public Supabase key is allowed');
if (key.split('.').length === 3 && JSON.parse(Buffer.from(key.split('.')[1], 'base64url')).role !== 'anon') throw new Error('Only the anon role is allowed');
const tables = {
  weapons: 'weapons', gear: 'gear', toolbelts: 'toolbelts', keys: 'keys', vehicles: 'vehicles', consumables: 'consumables', accessories: 'accessories',
  medicines: 'meds', diseases: 'meds', perks: 'perks', occupations: 'perks', npcs: 'npcs', basebuilding_items: 'basebuilding',
  crafting_materials: 'materials', ammo_types: 'ammo', vehicle_components: 'vehicle-parts'
};
const relations = ['rarities', 'wiki_subcategories', 'weapon_attachments', 'medicine_treats_disease', 'npc_inventory', 'key_doors', 'vehicle_required_components'];
async function read(table) {
  const rows = [];
  for (let offset = 0; ; offset += 500) {
    const response = await fetch(`${base}/rest/v1/${table}?select=*&limit=500&offset=${offset}`, { headers: { apikey: key }, signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error(`Public catalogue read failed: ${table} (${response.status})`);
    const page = await response.json();
    if (!Array.isArray(page)) throw new Error(`Invalid catalogue response: ${table}`);
    rows.push(...page);
    if (page.length < 500) return rows;
  }
}
const database = Object.fromEntries(await Promise.all([...Object.keys(tables), ...relations].map(async table => [table, await read(table)])));
const statFields = ['damage_modifier', 'rate_of_fire_modifier', 'accuracy_modifier', 'capacity_modifier', 'ammo', 'type', 'damage', 'accuracy', 'rate_of_fire', 'capacity', 'weight', 'size', 'handling', 'melee_range', 'attack_speed', 'stamina_efficiency', 'inventory_slots', 'insulation', 'bleed_protection', 'blunt_protection', 'fire_protection', 'armor_rating', 'storage_capacity', 'use_function', 'hydration', 'energy', 'health', 'is_refillable', 'requires_can_opener', 'is_safe_to_eat_raw', 'speed', 'driving_handling', 'occupants', 'fuel_capacity', 'use_case', 'spawn_locations', 'location', 'points', 'is_lethal', 'slots', 'use'];
const text = value => typeof value === 'string' ? value.replace(/<[^>]*>/g, '').trim() : '';
const records = [];
for (const [table, category] of Object.entries(tables)) for (const row of database[table]) {
  if (!row.name?.trim()) throw new Error(`Unnamed public record: ${table}/${row.id}`);
  const slug = row.slug || slugify(row.name) || String(row.id);
  if (!/^[a-z0-9_-]+$/.test(slug)) throw new Error(`Unsafe slug: ${table}/${slug}`);
  const attributes = Object.fromEntries(statFields.filter(field => row[field] !== null && row[field] !== undefined && row[field] !== '' && ['string', 'number', 'boolean'].includes(typeof row[field])).map(field => [field, typeof row[field] === 'string' ? text(row[field]) : row[field]]));
  const rarity = database.rarities.find(r => r.id === row.rarity_id)?.name;
  const subcategory = database.wiki_subcategories.find(r => r.id === row.subcategory_id)?.name || row.category;
  if (rarity) attributes.rarity = rarity;
  if (subcategory) attributes.subcategory = subcategory;
  records.push({ id: row.id, table, category, slug, name: text(row.name), description: text(row.description), image: /^https:\/\//.test(row.image_url || '') ? row.image_url : null, attributes, relations: [] });
}
// Preserve the legacy name URL for the first record, and give same-name records
// stable identities rather than silently dropping them from the catalogue.
const previous = JSON.parse(await fs.readFile('src/data/wikiCatalog.json', 'utf8').catch(() => '[]'));
records.sort((a,b) => Number(previous.some(r => r.id === b.id && r.slug === b.slug)) - Number(previous.some(r => r.id === a.id && r.slug === a.slug)) || a.id.localeCompare(b.id, 'en'));
const seen = new Set();
for (const record of records) {
  const route = `${record.category}/${record.slug}`;
  if (seen.has(route)) { record.slug += `-${record.id.slice(0, 8)}`; record.disambiguator = record.id.slice(0, 8); }
  seen.add(`${record.category}/${record.slug}`);
}
const byRecord = (table, id) => records.find(r => r.table === table && r.id === id);
function connect(from, to, kind, quantity) {
  if (!from || !to) return;
  const link = { category: to.category, slug: to.slug, name: to.name, kind, ...(quantity ? { quantity } : {}) };
  if (!from.relations.some(r => r.category === link.category && r.slug === link.slug && r.kind === kind)) from.relations.push(link);
}
for (const row of database.weapon_attachments) { const a = byRecord('weapons', row.weapon_id), b = byRecord('accessories', row.accessory_id); connect(a, b, 'attachments'); connect(b, a, 'compatible'); }
for (const row of database.medicine_treats_disease) { const a = byRecord('medicines', row.medicine_id), b = byRecord('diseases', row.disease_id); connect(a, b, 'treats'); connect(b, a, 'treatments'); }
for (const row of database.npc_inventory) { const a = byRecord('npcs', row.npc_id), b = byRecord(row.item_type, row.item_id); connect(a, b, 'inventory'); connect(b, a, 'sellers'); }
for (const row of database.vehicle_required_components) { const a = byRecord('vehicles', row.vehicle_id), b = byRecord('vehicle_components', row.component_id); connect(a, b, 'components', row.quantity); connect(b, a, 'compatible'); }
for (const row of database.basebuilding_items) for (const material of row.requirements || []) { const a = byRecord('basebuilding_items', row.id), b = byRecord('crafting_materials', material.item_id); connect(a, b, 'materials', material.quantity); connect(b, a, 'recipes'); }
for (const row of database.consumables) connect(byRecord('consumables', row.id), byRecord('consumables', row.cooked_version_id), 'cooked');
for (const row of database.weapons) { const a = byRecord('weapons', row.id), b = records.find(r => r.table === 'ammo_types' && r.name === row.ammo); connect(a, b, 'ammo'); connect(b, a, 'compatible'); }
for (const row of database.key_doors) { const item = byRecord('keys', row.key_id); if (item && row.door_description) item.attributes.doors = [item.attributes.doors, text(row.door_description)].filter(Boolean).join('; '); }
records.sort((a, b) => `${a.category}/${a.slug}`.localeCompare(`${b.category}/${b.slug}`, 'en'));
const paths = records.map(r => `${r.category}/${r.slug}`);
if (new Set(paths).size !== paths.length) throw new Error('Duplicate wiki slugs: ' + paths.filter((p,i) => paths.indexOf(p) !== i).join(', '));
if (!records.length) throw new Error('Refusing to publish an empty catalogue');
for (const record of records) record.relations.sort((a,b) => `${a.kind}/${a.slug}`.localeCompare(`${b.kind}/${b.slug}`, 'en'));
await fs.writeFile('src/data/wikiCatalog.json', JSON.stringify(records, null, 2) + '\n');
console.log(`Synchronized ${records.length} public wiki records across ${new Set(records.map(r => r.category)).size} categories.`);

