import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://facbshcmgrjexsvpuwgn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhY2JzaGNtZ3JqZXhzdnB1d2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxOTI1NjAsImV4cCI6MjA3Nzc2ODU2MH0.1-TvO37dJS8YvU_gkOpFpZlIx_0U-ebEEMrjqtBW5Og';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkCategories() {
    const { data, error } = await supabase.from('marker_categories').select('*');
    if (error) {
        console.error(error);
        return;
    }

    console.log("Total Categories:", data.length);
    const seen = new Set();
    const dups = [];

    data.forEach(c => {
        const key = c.name + '|' + c.group_name;
        if (seen.has(key)) {
            dups.push(c);
        } else {
            seen.add(key);
        }
    });

    console.log("duplicates found:", dups.length);
    if (dups.length > 0) {
        console.log("Sample duplicates:", dups.slice(0, 5).map(c => c.name));
    }

    console.log("Groups found:", [...new Set(data.map(c => c.group_name))]);
}

checkCategories();
