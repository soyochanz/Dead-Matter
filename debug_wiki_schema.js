
import { supabase } from './src/lib/customSupabaseClient.js';

const tables = ['keys', 'weapons', 'gear', 'medicines', 'accesories', 'npcs', 'vehicles', 'toolbelts'];

async function checkSchemas() {
    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.log(`Error checking ${table}:`, error.message);
        } else if (data && data.length > 0) {
            const keys = Object.keys(data[0]);
            console.log(`Table: ${table}`);
            console.log(`Columns: ${keys.join(', ')}`);
            // Check specifically for image columns
            const imageCol = keys.find(k => k.includes('image') || k.includes('img'));
            console.log(`Image Column: ${imageCol || 'NONE'}`);
            console.log('---');
        } else {
            console.log(`Table ${table} is empty or exists but no data.`);
        }
    }
}

checkSchemas();
