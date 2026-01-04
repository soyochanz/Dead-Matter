import { createClient } from '@supabase/supabase-js';

const getEnvVar = (name, fallback) => {
    const value = import.meta.env[name];
    if (!value || value === 'undefined' || value === '') return fallback;
    return value;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', 'https://facbshcmgrjexsvpuwgn.supabase.co');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhY2JzaGNtZ3JqZXhzdnB1d2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxOTI1NjAsImV4cCI6MjA3Nzc2ODU2MH0.1-TvO37dJS8YvU_gkOpFpZlIx_0U-ebEEMrjqtBW5Og');

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase configuration is missing fallbacks!');
}

const mySupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storage: window.localStorage,
    }
});

export default mySupabaseClient;

export {
    mySupabaseClient,
    mySupabaseClient as supabase,
};

