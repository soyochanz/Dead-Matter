import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://facbshcmgrjexsvpuwgn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhY2JzaGNtZ3JqZXhzdnB1d2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxOTI1NjAsImV4cCI6MjA3Nzc2ODU2MH0.1-TvO37dJS8YvU_gkOpFpZlIx_0U-ebEEMrjqtBW5Og';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const pueblosImportantes = [
    { name: 'Dead Mans Flats', lat: 0.00729, lng: 0.01054 },
    { name: 'Radio Station', lat: 0.00561, lng: 0.01298 },
    { name: 'KP Research Centre', lat: 0.00608, lng: 0.00791 },
    { name: 'Exshaw', lat: 0.00637, lng: 0.01700 },
    { name: 'Dominion', lat: 0.01466, lng: 0.00774 },
    { name: 'Canmore Hamlet', lat: 0.01063, lng: 0.00583 },
    { name: 'NERA Mass Grave Site', lat: 0.00890, lng: 0.02072 },
    { name: 'Seebe Hydroelectric Dam', lat: 0.00790, lng: 0.02165 },
    { name: "Gary's Cabin Co", lat: 0.00890, lng: 0.00956 },
    { name: 'Three Sisters Campground & Cabins', lat: 0.01289, lng: 0.00688 },
    { name: 'Survivalist Cabin', lat: 0.00786, lng: 0.01283 },
    { name: 'Shooting Range', lat: 0.00510, lng: 0.01144 },
    { name: 'Federal Stockpile', lat: 0.00438, lng: 0.02262 },
    { name: 'Grotto Mountain Quarry', lat: 0.01785, lng: 0.00872 },
    { name: 'Gamma Mike', lat: 0.01707, lng: 0.01241 },
    { name: 'Pigen Pass Mountain Resort', lat: 0.00409, lng: 0.01087 },
];

const pueblosMenosImportantes = [
    { name: 'Lumberyard', lat: 0.00956, lng: 0.00902 },
    { name: 'Kananaskis Golf Course', lat: 0.00815, lng: 0.02037 },
    { name: "Clyde's Trailer Park", lat: 0.00941, lng: 0.00840 },
    { name: 'Graymont Plant', lat: 0.00746, lng: 0.01842 },
    { name: 'Elk Flats Campground', lat: 0.00682, lng: 0.01870 },
    { name: 'Bow Valley Campground', lat: 0.00682, lng: 0.01932 },
    { name: 'Seebe Quarry', lat: 0.00692, lng: 0.02057 },
    { name: 'Exshaw Concrete Plant', lat: 0.00719, lng: 0.01589 },
    { name: "Gonzo's Gas Station", lat: 0.00585, lng: 0.01247 },
    { name: 'Rafting Center', lat: 0.00851, lng: 0.00975 },
    { name: 'Baymag Industrial Complex', lat: 0.00697, lng: 0.01367 },
    { name: 'Willow Rock Bunker', lat: 0.00720, lng: 0.02289 },
    { name: 'Bowriver Campground', lat: 0.01175, lng: 0.00682 },
    { name: 'Kananaskis White Water Rafting Center', lat: 0.00731, lng: 0.02163 },
    { name: 'Lac Des Arcs Campground', lat: 0.00619, lng: 0.01652 },
    { name: 'Backcountry Campground', lat: 0.00577, lng: 0.01810 },
    { name: 'Pasko Cave', lat: 0.00544, lng: 0.01806 },
    { name: 'Lake Lazarus', lat: 0.01730, lng: 0.01135 },
    { name: 'Rats Nest Cave', lat: 0.01647, lng: 0.00900 },
    { name: 'Pasko Lumberyard', lat: 0.00490, lng: 0.00992 },
    { name: "Ken's Hillside Cabins", lat: 0.00516, lng: 0.00849 },
    { name: 'Pasko Lake Cabins', lat: 0.00464, lng: 0.00764 },
    { name: 'Pasko Lake Rec Center', lat: 0.00497, lng: 0.00925 },
];

async function migrateZones() {
    console.log("Starting Zone Migration (Split Major/Minor)...");

    // 0. Cleanup old monolithic 'Zones' category if exists
    const { data: oldCat } = await supabase.from('marker_categories').select('id').eq('name', 'Zones').single();
    if (oldCat) {
        console.log("Cleaning up old 'Zones' markers...");
        const { error: delError } = await supabase.from('map_markers').delete().eq('category_id', oldCat.id);
        if (!delError) {
            await supabase.from('marker_categories').delete().eq('id', oldCat.id);
        }
    }

    // 1. Create/Get 'Zones (Major)' and 'Zones (Minor)'
    const getOrCreateCat = async (name) => {
        let { data } = await supabase.from('marker_categories').select('id').eq('name', name).single();
        if (!data) {
            const { data: newCat } = await supabase.from('marker_categories')
                .insert({ name: name, group_name: 'meta', icon_url: null })
                .select().single();
            data = newCat;
        }
        return data.id;
    };

    const majorId = await getOrCreateCat('Zones (Major)');
    const minorId = await getOrCreateCat('Zones (Minor)');

    console.log("Major ID:", majorId, "Minor ID:", minorId);

    // 2. Insert Markers
    const insertList = async (list, catId) => {
        let count = 0;
        for (const z of list) {
            // Check duplicate by title + category
            const { data: dup } = await supabase
                .from('map_markers')
                .select('id')
                .eq('title', z.name)
                .eq('category_id', catId)
                .single();

            if (dup) continue;

            const { error } = await supabase.from('map_markers').insert({
                category_id: catId,
                lat: z.lat,
                lng: z.lng,
                title: z.name,
                description: null,
                image_url: null,
                infected_level: null
            });

            if (error) console.error(`Failed to insert ${z.name}:`, error.message);
            else count++;
        }
        return count;
    };

    const majorCount = await insertList(pueblosImportantes, majorId);
    const minorCount = await insertList(pueblosMenosImportantes, minorId);

    console.log(`Migrated ${majorCount} Major zones and ${minorCount} Minor zones.`);
}

migrateZones();
