import { supabase } from './src/lib/customSupabaseClient.js';

async function updateKeyIcon() {
    const { error } = await supabase
        .from('marker_categories')
        .update({ icon_url: '/key-icon.svg' })
        .eq('id', '15f843f0-ee79-4a06-bc25-f3652ff40b88');

    if (error) {
        console.error('Error updating icon:', error);
    } else {
        console.log('Successfully updated Key Door icon to /key-icon.svg');
    }
}

updateKeyIcon();
