import { supabase } from './src/lib/customSupabaseClient.js';

async function run() {
    // 1. Add Vehicles Category
    console.log("Adding 'Vehicles' category...");
    const { data: cat, error: catError } = await supabase
        .from('marker_categories')
        .insert([{
            name: 'Vehicles',
            group_name: 'misc',
            icon_url: '/Items/map/vehicle.png' // Placeholder, user can update
        }])
        .select();

    if (catError) console.error("Error adding category:", catError.message);
    else console.log("Added category:", cat);

    // 2. Inspect Tables
    const tables = ['keys', 'weapons', 'vehicles'];
    for (const t of tables) {
        console.log(`\nInspecting '${t}'...`);
        const { data, error } = await supabase.from(t).select('*').limit(1);
        if (error) console.error(`Error inspecting ${t}:`, error.message);
        else console.log(`Sample ${t}:`, data);
    }
}

run();
