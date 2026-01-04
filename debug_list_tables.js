import { supabase } from './src/lib/customSupabaseClient.js';

async function listTables() {
    // There isn't a direct "list tables" in js client usually, so we might try to infer or just select from a known table if we guess names. 
    // BUT we can try to select from information_schema via rpc if we had one, or just try to select * from 'items' or 'wiki_items' and see if it errors.

    // Strategy: Try the most likely name 'items' first.
    console.log("Checking table 'items'...");
    const { data: items, error: itemsError } = await supabase.from('items').select('*').limit(1);
    if (!itemsError) {
        console.log("Table 'items' EXISTS. Sample:", items);
    } else {
        console.log("Table 'items' error:", itemsError.message);
    }

    // Strategy: Try 'wiki_items'
    console.log("Checking table 'wiki_items'...");
    const { data: wiki, error: wikiError } = await supabase.from('wiki_items').select('*').limit(1);
    if (!wikiError) {
        console.log("Table 'wiki_items' EXISTS. Sample:", wiki);
    } else {
        console.log("Table 'wiki_items' error:", wikiError.message);
    }
}

listTables();
