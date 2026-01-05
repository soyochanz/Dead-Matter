
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://facbshcmgrjexsvpuwgn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhY2JzaGNtZ3JqZXhzdnB1d2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxOTI1NjAsImV4cCI6MjA3Nzc2ODU2MH0.1-TvO37dJS8YvU_gkOpFpZlIx_0U-ebEEMrjqtBW5Og';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectTable() {
    console.log("Inspecting media_items table...");
    const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .limit(10);

    if (error) {
        console.error("Error fetching media:", error);
        return;
    }

    if (data.length > 0) {
        console.log("Columns:", Object.keys(data[0]));
        console.log("Sample Data:", data[0]);
    } else {
        console.log("Table is empty, cannot infer columns from data.");
    }
}

inspectTable();
