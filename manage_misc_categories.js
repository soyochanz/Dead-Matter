import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://facbshcmgrjexsvpuwgn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhY2JzaGNtZ3JqZXhzdnB1d2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxOTI1NjAsImV4cCI6MjA3Nzc2ODU2MH0.1-TvO37dJS8YvU_gkOpFpZlIx_0U-ebEEMrjqtBW5Og';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function manageMisc() {
    console.log("Checking categories...");
    const { data: categories, error } = await supabase.from('marker_categories').select('*');
    if (error) { console.error(error); return; }

    // 1. Move Keys to Misc
    const keyCat = categories.find(c => c.name.includes('Key') || c.name.includes('Door'));
    if (keyCat) {
        console.log(`Found Key category: ${keyCat.name} (${keyCat.group_name})`);
        if (keyCat.group_name !== 'misc') {
            console.log("Updating to 'misc'...");
            const { error: upError } = await supabase
                .from('marker_categories')
                .update({ group_name: 'misc' })
                .eq('id', keyCat.id);
            if (upError) console.error("Error updating key cat:", upError);
            else console.log("Key category moved to Misc.");
        }
    } else {
        console.log("No Key/Door category found.");
    }

    // 2. Create/Check NPCs
    const npcCat = categories.find(c => c.name === 'NPCs');
    if (npcCat) {
        console.log(`NPCs category exists: ${npcCat.name} (${npcCat.group_name})`);
        if (npcCat.group_name !== 'misc') {
            const { error: upError } = await supabase
                .from('marker_categories')
                .update({ group_name: 'misc' })
                .eq('id', npcCat.id);
            if (!upError) console.log("NPCs moved to misc.");
        }
    } else {
        console.log("Creating NPCs category...");
        const { error: insError } = await supabase
            .from('marker_categories')
            .insert({
                name: 'NPCs',
                group_name: 'misc',
                icon_url: 'https://cdn-icons-png.flaticon.com/512/3220/3220315.png' // Default NPC icon or placeholder
            });
        if (insError) console.error("Error creating NPCs:", insError);
        else console.log("NPCs category created.");
    }
}

manageMisc();
