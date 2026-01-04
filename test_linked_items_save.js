import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read Supabase credentials from customSupabaseClient.js
const clientPath = path.resolve('src/lib/customSupabaseClient.js');
const clientContent = fs.readFileSync(clientPath, 'utf8');

const urlMatch = clientContent.match(/supabaseUrl\s*=\s*['"]([^'"]+)['"]/);
const keyMatch = clientContent.match(/supabaseAnonKey\s*=\s*['"]([^'"]+)['"]/);

if (!urlMatch || !keyMatch) {
    console.error("Could not find Supabase URL/Key");
    process.exit(1);
}

const supabase = createClient(urlMatch[1], keyMatch[1]);

async function testLinkedItemsSave() {
    console.log("Testing linked items save functionality...\n");

    // 1. Get a marker to test with
    const { data: markers, error: markerError } = await supabase
        .from('map_markers')
        .select('id, title')
        .limit(1);

    if (markerError || !markers || markers.length === 0) {
        console.error("❌ Could not fetch a marker:", markerError?.message);
        return;
    }

    const testMarker = markers[0];
    console.log(`✅ Using marker: ${testMarker.title} (${testMarker.id})`);

    // 2. Get a key to link
    const { data: keys, error: keyError } = await supabase
        .from('keys')
        .select('id, name')
        .limit(1);

    if (keyError || !keys || keys.length === 0) {
        console.error("❌ Could not fetch a key:", keyError?.message);
        return;
    }

    const testKey = keys[0];
    console.log(`✅ Using key: ${testKey.name} (${testKey.id})\n`);

    // 3. Try to insert a linked item
    console.log("Attempting to insert linked item...");
    const { data: insertData, error: insertError } = await supabase
        .from('marker_linked_items')
        .insert({
            marker_id: testMarker.id,
            item_uuid: testKey.id,
            item_table: 'keys'
        })
        .select();

    if (insertError) {
        console.error("❌ Insert failed:", insertError.message);
        console.error("   Code:", insertError.code);
        console.error("   Details:", insertError.details);
        console.error("   Hint:", insertError.hint);

        if (insertError.message.includes('policy')) {
            console.log("\n⚠️  This is an RLS (Row Level Security) policy error!");
            console.log("   The table exists but your user doesn't have permission to insert.");
            console.log("   You need to run the fix_linked_items_typo.sql script in Supabase SQL Editor.");
        }
    } else {
        console.log("✅ Insert succeeded!");
        console.log("   Data:", insertData);

        // Clean up
        await supabase
            .from('marker_linked_items')
            .delete()
            .eq('marker_id', testMarker.id)
            .eq('item_uuid', testKey.id);
        console.log("✅ Cleanup complete");
    }
}

testLinkedItemsSave();
