import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://facbshcmgrjexsvpuwgn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhY2JzaGNtZ3JqZXhzdnB1d2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxOTI1NjAsImV4cCI6MjA3Nzc2ODU2MH0.1-TvO37dJS8YvU_gkOpFpZlIx_0U-ebEEMrjqtBW5Og';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    console.log("Testing connection to:", supabaseUrl);

    try {
        const { data: categories, error: catError } = await supabase.from('marker_categories').select('*').limit(5);
        if (catError) {
            console.error("Error fetching marker_categories:", catError);
        } else {
            console.log("Categories found:", categories.length);
            console.log("Sample category:", categories[0]);
        }

        const { data: markers, error: markError } = await supabase.from('map_markers').select('*').limit(5);
        if (markError) {
            console.error("Error fetching map_markers:", markError);
        } else {
            console.log("Markers found:", markers.length);
        }
    } catch (e) {
        console.error("Exception:", e);
    }
}

testConnection();
