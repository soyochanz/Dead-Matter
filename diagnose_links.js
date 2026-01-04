import { createClient } from '@supabase/supabase-js';
// import dotenv from 'dotenv'; // Not needed
import fs from 'fs';
import path from 'path';

// Load env vars
// Try to read from .env.local or similar if possible, or source from customSupabaseClient.js
// Since we can't easily parse js file, we'll try to use the ones from the project if available
// or hardcode placeholders if we can't find them.
// Actually, looking at previous logs, we don't have the keys in env vars usually.
// I will read `src/lib/customSupabaseClient.js` to extract them.

const clientPath = path.resolve('src/lib/customSupabaseClient.js');
const clientContent = fs.readFileSync(clientPath, 'utf8');

const urlMatch = clientContent.match(/supabaseUrl\s*=\s*['"]([^'"]+)['"]/);
const keyMatch = clientContent.match(/supabaseAnonKey\s*=\s*['"]([^'"]+)['"]/);

if (!urlMatch || !keyMatch) {
    console.error("Could not find Supabase URL/Key in customSupabaseClient.js");
    process.exit(1);
}

const supabaseUrl = urlMatch[1];
const supabaseKey = keyMatch[1];

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
    console.log("Diagnosing marker_linked_items table...");

    // 1. Check if table exists by selecting
    const { data, error } = await supabase.from('marker_linked_items').select('count', { count: 'exact', head: true });

    if (error) {
        if (error.code === '42P01') {
            console.log("❌ Table 'marker_linked_items' DOES NOT EXIST.");
            console.log("   -> You MUST run the SQL migration 'create_linked_items_table.sql'.");
        } else {
            console.log("❌ Error accessing table:", error.message);
        }
    } else {
        console.log("✅ Table 'marker_linked_items' exists.");
    }

    // 2. Try to insert a test item with 'accessories' to check constraint
    // We need a valid marker ID. Fetch one.
    const { data: markers } = await supabase.from('map_markers').select('id').limit(1);
    if (!markers || markers.length === 0) {
        console.log("⚠️ No markers found to test insert.");
        return;
    }
    const markerId = markers[0].id;
    const testUuid = '00000000-0000-0000-0000-000000000000'; // dummy uuid

    // Test 'accessories' (the correct separate spelling)
    console.log("Testing insert with 'accessories'...");
    const { error: insertError } = await supabase.from('marker_linked_items').insert({
        marker_id: markerId,
        item_uuid: testUuid,
        item_table: 'accessories'
    });

    if (insertError) {
        console.log("❌ Insert 'accessories' failed:", insertError.message);
        if (insertError.message.includes('check constraint')) {
            console.log("   -> This likely means the CHECK constraint has the typo 'accesories'.");
        }
    } else {
        console.log("✅ Insert 'accessories' succeeded (Constraint is correct).");
        // Clean up
        await supabase.from('marker_linked_items').delete().eq('marker_id', markerId).eq('item_uuid', testUuid);
    }
}

diagnose();
