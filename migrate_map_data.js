import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://facbshcmgrjexsvpuwgn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhY2JzaGNtZ3JqZXhzdnB1d2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxOTI1NjAsImV4cCI6MjA3Nzc2ODU2MH0.1-TvO37dJS8YvU_gkOpFpZlIx_0U-ebEEMrjqtBW5Og';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const categories = [
    // Landmarks
    { name: 'Radio Tower', group: 'landmarks', icon: 'https://deadmatterdb.com/icons/radiotower.png' },
    { name: 'Water Tower', group: 'landmarks', icon: 'https://deadmatterdb.com/icons/watertower.png' },
    { name: 'Watch Tower', group: 'landmarks', icon: 'https://deadmatterdb.com/icons/watchtower.png' },
    { name: 'Tower Crane', group: 'landmarks', icon: 'https://deadmatterdb.com/icons/towercrane.png' },
    { name: 'Hunting Stand', group: 'landmarks', icon: 'https://deadmatterdb.com/icons/huntingtower.png' },
    { name: 'Cave', group: 'landmarks', icon: 'https://deadmatterdb.com/icons/cave.png' },
    { name: 'Train', group: 'landmarks', icon: 'https://facbshcmgrjexsvpuwgn.supabase.co/storage/v1/object/public/Map/trainmarker.png' },

    // Military
    { name: 'Military Loot', group: 'military', icon: null }, // DivIcon handled in frontend
    { name: 'Barracks', group: 'military', icon: 'https://deadmatterdb.com/icons/barracks_icon.svg' },
    { name: 'Camping Tent', group: 'military', icon: 'https://deadmatterdb.com/icons/icontentmil.png' },
    { name: 'Helicrash', group: 'military', icon: 'https://facbshcmgrjexsvpuwgn.supabase.co/storage/v1/object/public/Items/map/recopter.png' },
    { name: 'Military Base', group: 'military', icon: 'https://deadmatterdb.com/icons/military_base_icon.svg' },
    { name: 'Shooting Range', group: 'military', icon: 'https://facbshcmgrjexsvpuwgn.supabase.co/storage/v1/object/public/Items/map/range.png' },
    { name: 'Military Bunker', group: 'military', icon: 'https://facbshcmgrjexsvpuwgn.supabase.co/storage/v1/object/public/Items/map/bunkermil.png' },

    // Medical
    { name: 'Medical Loot', group: 'medical', icon: null },
    { name: 'Hospital', group: 'medical', icon: 'https://facbshcmgrjexsvpuwgn.supabase.co/storage/v1/object/public/Items/map/medical.png' },
    { name: 'NERA Tent', group: 'medical', icon: 'https://facbshcmgrjexsvpuwgn.supabase.co/storage/v1/object/public/Items/map/tentmed.png' },

    // Industrial
    { name: 'Industrial Loot', group: 'industrial', icon: null },
    { name: 'Factory', group: 'industrial', icon: 'https://facbshcmgrjexsvpuwgn.supabase.co/storage/v1/object/public/Items/map/industry123.png' },
    { name: 'Hangar', group: 'industrial', icon: 'https://deadmatterdb.com/icons/hangar.png' },

    // Civilian
    { name: 'Civilian Loot', group: 'civilian', icon: null },
    { name: 'Key Door', group: 'civilian', icon: 'https://facbshcmgrjexsvpuwgn.supabase.co/storage/v1/object/public/Items/map/key.png' },
    { name: 'Civilian Bunker', group: 'civilian', icon: 'https://facbshcmgrjexsvpuwgn.supabase.co/storage/v1/object/public/Items/map/bunkercivil.png' },
    { name: 'Firestation', group: 'civilian', icon: 'https://deadmatterdb.com/icons/fire.png' },
    { name: 'Golf Course', group: 'civilian', icon: 'https://facbshcmgrjexsvpuwgn.supabase.co/storage/v1/object/public/Items/map/golf%20(1).png' },
    { name: 'School', group: 'civilian', icon: 'https://facbshcmgrjexsvpuwgn.supabase.co/storage/v1/object/public/Items/map/school.png' },
    { name: 'Gas Station', group: 'civilian', icon: 'https://facbshcmgrjexsvpuwgn.supabase.co/storage/v1/object/public/Items/map/gasoline%20(1).png' },
    { name: 'Water Source', group: 'civilian', icon: 'https://facbshcmgrjexsvpuwgn.supabase.co/storage/v1/object/public/Map/noun-water-tank-7753126%20(1).png' },
    { name: 'Gas Source', group: 'civilian', icon: 'https://facbshcmgrjexsvpuwgn.supabase.co/storage/v1/object/public/Map/gastank.png' },
    { name: 'Deer Stand', group: 'civilian', icon: 'https://deadmatterdb.com/icons/deerstand_icon.svg' }
];

const markersData = [
    { category: 'Key Door', lat: 0.01642, lng: 0.00908, popup: "Key Door" },
    { category: 'Radio Tower', lat: 0.00787, lng: 0.02181, popup: 'Radio Tower Seebe' },
    { category: 'Radio Tower', lat: 0.00469, lng: 0.00863, popup: 'Radio Tower Pasko' },
    { category: 'Radio Tower', lat: 0.01151, lng: 0.00827, popup: 'Radio Tower River' },
    { category: 'Radio Tower', lat: 0.01036, lng: 0.00815, popup: 'Radio Tower River 2' },
    { category: 'Radio Tower', lat: 0.00611, lng: 0.00801, popup: 'Radio Tower KP' },
    { category: 'Radio Tower', lat: 0.00558, lng: 0.01299, popup: 'Radio Tower' },
    { category: 'Radio Tower', lat: 0.01441, lng: 0.00711, popup: 'Radio Tower Dominion' },
    { category: 'Radio Tower', lat: 0.00669, lng: 0.02336, popup: 'Radio Tower' },
    { category: 'Radio Tower', lat: 0.00697, lng: 0.01731, popup: 'Radio Tower' },
    { category: 'Water Tower', lat: 0.00766, lng: 0.00990, popup: 'Water Tower' },
    { category: 'Watch Tower', lat: 0.01260, lng: 0.00707, popup: 'Watch Tower' },
    { category: 'Watch Tower', lat: 0.00975, lng: 0.00776, popup: 'Watch Tower River' },
    { category: 'Watch Tower', lat: 0.00976, lng: 0.00789, popup: 'Watch Tower River 2' },
    { category: 'Watch Tower', lat: 0.00668, lng: 0.00962, popup: 'DMF Watch Tower' },
    { category: 'Watch Tower', lat: 0.00713, lng: 0.00890, popup: 'Watch Tower' },
    { category: 'Watch Tower', lat: 0.00844, lng: 0.01184, popup: 'Watch Tower' },
    { category: 'Watch Tower', lat: 0.00478, lng: 0.02285, popup: 'Watch Tower' },
    { category: 'Tower Crane', lat: 0.00733, lng: 0.01606, popup: 'Tower Crane' },
    { category: 'Hunting Stand', lat: 0.00540, lng: 0.01805, popup: 'Hunting Stand' },
    { category: 'Hunting Stand', lat: 0.00513, lng: 0.00823, popup: 'Hunting Stand' },
    { category: 'Cave', lat: 0.00549, lng: 0.01808, popup: 'Pasko Cave' },
    { category: 'Civilian Bunker', lat: 0.00785, lng: 0.01284, popup: 'Survivalist Bunker' },
    { category: 'School', lat: 0.01010, lng: 0.00575, popup: 'School' },
    { category: 'Golf Course', lat: 0.00910, lng: 0.00615, popup: 'Golf Course' },
    { category: 'Golf Course', lat: 0.00822, lng: 0.02041, popup: 'Golf' },
    { category: 'Gas Station', lat: 0.00725, lng: 0.01010, popup: 'Dustys Gas Station' },
    { category: 'Gas Station', lat: 0.00761, lng: 0.00979, popup: 'Gas' },
    { category: 'Gas Station', lat: 0.00623, lng: 0.01676, popup: 'Gas' },
    { category: 'Gas Station', lat: 0.00585, lng: 0.01247, popup: "Gonzo's Gas Station" },
    { category: 'Helicrash', lat: 0.00479, lng: 0.00961, popup: 'Helicrash Site' },
    { category: 'Helicrash', lat: 0.00535, lng: 0.00850, popup: 'Helicrash Site' },
    { category: 'Helicrash', lat: 0.00508, lng: 0.00908, popup: 'Helicrash Site' },
    { category: 'Helicrash', lat: 0.00463, lng: 0.00942, popup: 'Helicrash Site' },
    { category: 'Helicrash', lat: 0.00491, lng: 0.00861, popup: 'Helicrash Site' },
    { category: 'Shooting Range', lat: 0.00517, lng: 0.01152, popup: 'Shooting Range' },
    { category: 'Military Bunker', lat: 0.00440, lng: 0.02262, popup: 'Federal Stockpile Bunker' },
    { category: 'Military Bunker', lat: 0.00718, lng: 0.02290, popup: 'Willow Rock Bunker' },
    // Loots without popup
    { category: 'Military Loot', lat: 0.00612, lng: 0.00805, popup: "Military Loot Pile 1" },
    { category: 'Military Loot', lat: 0.00613, lng: 0.00805 },
    { category: 'Military Loot', lat: 0.00646, lng: 0.01059 },
    { category: 'Military Loot', lat: 0.00522, lng: 0.01149 },
    { category: 'Military Loot', lat: 0.00518, lng: 0.01160 },
    { category: 'Military Loot', lat: 0.01487, lng: 0.00662 },
    { category: 'Military Loot', lat: 0.00770, lng: 0.00964 },
    { category: 'Military Loot', lat: 0.00523, lng: 0.01145 },
    { category: 'Military Loot', lat: 0.00522, lng: 0.01142 },
    { category: 'Military Loot', lat: 0.00522, lng: 0.01143 },
    { category: 'Military Loot', lat: 0.00522, lng: 0.01148 },
    { category: 'Military Loot', lat: 0.00521, lng: 0.01150 },
    { category: 'Military Loot', lat: 0.00519, lng: 0.01156 },
    { category: 'Military Loot', lat: 0.00518, lng: 0.01158 },
    { category: 'Military Loot', lat: 0.00516, lng: 0.01161 },
    { category: 'Medical Loot', lat: 0.00715, lng: 0.01019, popup: 'NERA Orange Tent' },
    { category: 'Medical Loot', lat: 0.00714, lng: 0.01020, popup: 'NERA Orange Tent' },
    { category: 'Medical Loot', lat: 0.00713, lng: 0.01021, popup: 'NERA Orange Tent' },
    { category: 'Medical Loot', lat: 0.00716, lng: 0.01020, popup: 'NERA Orange Tent' },
    { category: 'Medical Loot', lat: 0.00715, lng: 0.01021, popup: 'NERA Orange Tent' },
    { category: 'NERA Tent', lat: 0.00729, lng: 0.01007, popup: 'NERA Tent' },
    { category: 'Military Bunker', lat: 0.01705, lng: 0.01256, popup: 'Gamma Mike Bunker' },
    { category: 'NERA Tent', lat: 0.01719, lng: 0.01256, popup: 'NERA Tent' },
    { category: 'NERA Tent', lat: 0.01723, lng: 0.01247, popup: 'NERA Tent' },
    { category: 'NERA Tent', lat: 0.01725, lng: 0.01251, popup: 'NERA Tent' },
    { category: 'NERA Tent', lat: 0.01724, lng: 0.01255, popup: 'NERA Tent' },
    { category: 'NERA Tent', lat: 0.01788, lng: 0.00859, popup: 'NERA Tent' },
    { category: 'NERA Tent', lat: 0.01790, lng: 0.00861, popup: 'NERA Tent' },
    { category: 'NERA Tent', lat: 0.00683, lng: 0.01916, popup: 'NERA Tent' },
    { category: 'NERA Tent', lat: 0.00558, lng: 0.02306, popup: 'NERA Tent' },
    { category: 'NERA Tent', lat: 0.00736, lng: 0.01002, popup: 'NERA Tent' },
    { category: 'Factory', lat: 0.00713, lng: 0.01602, popup: 'Factory' },
    { category: 'Factory', lat: 0.00700, lng: 0.01372, popup: 'Factory' },
    { category: 'Factory', lat: 0.00745, lng: 0.01842, popup: 'Factory' },
    { category: 'Industrial Loot', lat: 0.00586, lng: 0.01251 },
    { category: 'Industrial Loot', lat: 0.00586, lng: 0.01253 },
    { category: 'Industrial Loot', lat: 0.00583, lng: 0.01253 },
    { category: 'Industrial Loot', lat: 0.00584, lng: 0.01251 },
    { category: 'Industrial Loot', lat: 0.00514, lng: 0.01165 },
    { category: 'Industrial Loot', lat: 0.00661, lng: 0.01131 },
    { category: 'Industrial Loot', lat: 0.00663, lng: 0.01128 },
    { category: 'Industrial Loot', lat: 0.00667, lng: 0.01127 },
    { category: 'Industrial Loot', lat: 0.00665, lng: 0.01139 },
    { category: 'Industrial Loot', lat: 0.00668, lng: 0.01134 },
    { category: 'Industrial Loot', lat: 0.00676, lng: 0.01152 },
    { category: 'Industrial Loot', lat: 0.00685, lng: 0.01124 },
    { category: 'Water Source', lat: 0.00963, lng: 0.00820, popup: 'Water Source' },
    { category: 'Gas Source', lat: 0.00934, lng: 0.00784, popup: 'Butane Tank' },
    { category: 'Train', lat: 0.01420, lng: 0.00715, popup: 'Train' },
];

const landmarkInfo = {
    "Key Door": { img: "https://facbshcmgrjexsvpuwgn.supabase.co/storage/v1/object/public/Items/map/key.png", desc: "A locked door requiring a special key to access hidden loot.", loot: [{ type: "Special Access", color: "#FFD700" }], infected: "Low" },
    "Military Loot Pile 1": { img: null, desc: "A small military loot pile.", loot: [{ type: "Military", color: "#e24a4a" }], infected: "Low pop" },
    "Radio Tower KP": { img: "https://facbshcmgrjexsvpuwgn.supabase.co/storage/v1/object/public/Items/map/KPtower.png", desc: "Reinforced red-and-steel radio tower.", loot: [{ type: "Militar", color: "#e24a4aff" }, { type: "Civilian", color: "#A8E12F" }], infected: "High pop" },
    "Radio Tower Pasko": { img: "https://facbshcmgrjexsvpuwgn.supabase.co/storage/v1/object/public/Items/map/KPtower.png", desc: "Reinforced radio tower.", loot: [{ type: "Militar", color: "#e24a4aff" }, { type: "Civilian", color: "#A8E12F" }], infected: "medium pop" },
    "DMF Watch Tower": { img: "https://facbshcmgrjexsvpuwgn.supabase.co/storage/v1/object/public/Map/20251205222956_1.jpg", desc: "Cliffside lookout tower.", loot: [{ type: "Medical", color: "#ffb6f8" }, { type: "Civilian", color: "#A8E12F" }], infected: "Empty" },
    "NERA Orange Tent": { img: "https://facbshcmgrjexsvpuwgn.supabase.co/storage/v1/object/public/Map/neraorange.png", loot: [{ type: "Medical", color: "#ffb6f8" }] },
    "Dustys Gas Station": { img: "https://facbshcmgrjexsvpuwgn.supabase.co/storage/v1/object/public/Map/Dustys.png", desc: "Dustys Gas Station.", loot: [{ type: "Industrial", color: "#e8aa43" }, { type: "Civilian", color: "#A8E12F" }], infected: "High Pop" },
    "Water Source": { img: "https://facbshcmgrjexsvpuwgn.supabase.co/storage/v1/object/public/Map/20251218174656_1.jpg", desc: "A natural water source.", loot: [{ type: "Water", color: "#2e86de" }], infected: "Low" },
    "Train": { img: "https://facbshcmgrjexsvpuwgn.supabase.co/storage/v1/object/public/Map/trainmarker.png", desc: "Abandoned train cars.", loot: [{ type: "Industrial", color: "#e8aa43" }, { type: "Civilian", color: "#A8E12F" }], infected: "Medium" },
};

async function migrate() {
    console.log("Starting final migration...");

    try {
        // 1. Clear existing data (optional, but good for clean slate)
        console.log("Cleaning old data...");
        // Delete all data. Note: If RLS is preventing deletions, this might fail, but let's try.
        // To delete all, we filter by something common. 
        const { error: delLoot } = await supabase.from('marker_loot_tags').delete().neq('label', 'DUMMY_VAL');
        const { error: delMarkers } = await supabase.from('map_markers').delete().neq('title', 'DUMMY_VAL');

        if (delLoot) console.log("Note on cleaning loot:", delLoot.message);
        if (delMarkers) console.log("Note on cleaning markers:", delMarkers.message);

        const catMap = {};

        // 2. Ensure all categories exist
        for (const cat of categories) {
            let catId = null;

            // Try INSERT
            const { data: inserted, error: insertError } = await supabase
                .from('marker_categories')
                .insert({ name: cat.name, group_name: cat.group, icon_url: cat.icon })
                .select()
                .single();

            if (!insertError && inserted) {
                catId = inserted.id;
            } else {
                // If error (likely conflict), SELECT
                const { data: existing, error: fetchError } = await supabase
                    .from('marker_categories')
                    .select('id')
                    .eq('name', cat.name)
                    .single();

                if (existing) {
                    catId = existing.id;
                } else {
                    console.error(`Could not Resolve Category: ${cat.name}. Insert Error: ${insertError?.message}. Fetch Error: ${fetchError?.message}`);
                }
            }

            if (catId) {
                catMap[cat.name] = catId;
            }
        }

        console.log("Categories mapped:", Object.keys(catMap).length);

        // 3. Insert Markers
        let successCount = 0;
        for (const m of markersData) {
            const catId = catMap[m.category];
            if (!catId) {
                console.warn(`Category ID missing for: ${m.category}`);
                continue;
            }

            const info = landmarkInfo[m.popup] || {};

            const markerPayload = {
                category_id: catId,
                lat: m.lat,
                lng: m.lng,
                title: m.popup || m.category,
                description: info.desc || null,
                image_url: info.img || null,
                infected_level: info.infected || null
            };

            const { data: markerData, error: markerError } = await supabase
                .from('map_markers')
                .insert(markerPayload)
                .select()
                .single();

            if (markerError) {
                console.error("Error inserting marker:", markerError.message);
                continue;
            }

            successCount++;

            // 4. Insert Loot Tags
            if (info.loot) {
                const tags = info.loot.map(l => ({
                    marker_id: markerData.id,
                    label: l.type, // Column is 'label', checked in DB
                    color: l.color
                }));

                const { error: lootError } = await supabase
                    .from('marker_loot_tags')
                    .insert(tags);

                if (lootError) console.error("Error inserting loot tags:", lootError.message);
            }
        }

        console.log(`Migration complete! Successfully inserted ${successCount} markers.`);

    } catch (e) {
        console.error("Migration failed:", e);
    }
}

migrate();
