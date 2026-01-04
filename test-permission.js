import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://facbshcmgrjexsvpuwgn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhY2JzaGNtZ3JqZXhzdnB1d2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxOTI1NjAsImV4cCI6MjA3Nzc2ODU2MH0.1-TvO37dJS8YvU_gkOpFpZlIx_0U-ebEEMrjqtBW5Og';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testWrite() {
    console.log("Testing write permission...");
    const { data, error } = await supabase
        .from('marker_categories')
        .insert({ name: 'TEST_PERMISSION', group_name: 'test', icon_url: '' })
        .select();

    if (error) {
        console.error("Write failed:", error);
    } else {
        console.log("Write successful:", data);
        // Clean up
        await supabase.from('marker_categories').delete().eq('name', 'TEST_PERMISSION');
    }
}

testWrite();
