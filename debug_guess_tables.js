
import { createClient } from '@supabase/supabase-js';
import { supabase } from './src/lib/customSupabaseClient.js';

// Since we can't query information_schema easily with js client for all tables without permissons,
// we will try to just list the 'map_markers' to verify connection, and then try 'game_items', 'loot', etc.
// A better way if we have the service role key would be to use that, but we are using anon key + user auth potentially.

// Actually, I can try to access a public RPC if one exists, or just guess common names.
// Let's try 'game_items', 'wiki_pages', 'crafting_items'.
async function guessTables() {
    const candidates = ['game_items', 'wiki_pages', 'crafting_items', 'loot_table', 'items_wiki'];

    for (const table of candidates) {
        process.stdout.write(`Checking '${table}'... `);
        const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
        if (!error) {
            console.log("EXISTS!");
        } else {
            console.log("Not found (or permission denied).");
        }
    }
}

guessTables();
