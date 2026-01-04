import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://facbshcmgrjexsvpuwgn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhY2JzaGNtZ3JqZXhzdnB1d2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxOTI1NjAsImV4cCI6MjA3Nzc2ODU2MH0.1-TvO37dJS8YvU_gkOpFpZlIx_0U-ebEEMrjqtBW5Og';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function cleanupCategories() {
    console.log("Fetching categories...");
    const { data: categories, error } = await supabase.from('marker_categories').select('*').order('id');
    if (error) { console.error(error); return; }

    const seen = new Map(); // key -> id
    const toDelete = [];

    for (const cat of categories) {
        const key = cat.name + '|' + cat.group_name;
        if (seen.has(key)) {
            // Found duplicate
            toDelete.push(cat.id);
            // We should also update any markers using this ID to use the kept ID
            const keptId = seen.get(key);
            console.log(`Duplicate: ${cat.name} (${cat.id}) -> Keep (${keptId})`);

            // Re-assign markers
            const { error: updateError } = await supabase
                .from('map_markers')
                .update({ category_id: keptId })
                .eq('category_id', cat.id);

            if (updateError) console.error("Error reassigning markers:", updateError);

        } else {
            seen.set(key, cat.id);
        }
    }

    if (toDelete.length > 0) {
        console.log(`Deleting ${toDelete.length} duplicate categories...`);
        const { error: delError } = await supabase
            .from('marker_categories')
            .delete()
            .in('id', toDelete);

        if (delError) console.error("Error deleting:", delError);
        else console.log("Cleanup complete!");
    } else {
        console.log("No duplicates found.");
    }
}

cleanupCategories();
