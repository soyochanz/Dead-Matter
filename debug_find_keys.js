import { supabase } from './src/lib/customSupabaseClient.js';

async function findKeyCategory() {
    const { data, error } = await supabase
        .from('marker_categories')
        .select('*')
        .ilike('name', '%key%');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Found categories:', data);
    }
}

findKeyCategory();
