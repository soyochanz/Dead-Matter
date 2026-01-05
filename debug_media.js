
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://facbshcmgrjexsvpuwgn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhY2JzaGNtZ3JqZXhzdnB1d2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxOTI1NjAsImV4cCI6MjA3Nzc2ODU2MH0.1-TvO37dJS8YvU_gkOpFpZlIx_0U-ebEEMrjqtBW5Og';

const supabase = createClient(supabaseUrl, supabaseKey);

const extractYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

async function checkMedia() {
    console.log("Fetching media items...");
    const { data, error } = await supabase
        .from('media_items')
        .select('*, author:profiles(username)')
        .order('created_at', { ascending: false })
        .limit(3);

    if (error) {
        console.error("Error fetching media:", error);
        return;
    }

    console.log(`Found ${data.length} items.`);

    data.forEach((item, i) => {
        console.log(`\nItem ${i + 1}:`);
        console.log(`  ID: ${item.id}`);
        console.log(`  Title: ${item.title}`);
        console.log(`  Type: ${item.type}`);
        console.log(`  URL: ${item.url}`);
        console.log(`  Thumbnail (DB): ${item.thumbnail}`);

        const extractedId = extractYouTubeId(item.url);
        console.log(`  Extracted YT ID: ${extractedId}`);

        const generatedThumbnail = item.thumbnail || (item.type === 'video' ? `https://img.youtube.com/vi/${extractedId}/hqdefault.jpg` : item.url);
        console.log(`  Generated Thumbnail: ${generatedThumbnail}`);
    });
}

checkMedia();
