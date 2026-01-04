import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Check your environment variables.');
}

// Prevent crash if variables are missing, though functionality will be limited
const validUrl = supabaseUrl || 'https://facbshcmgrjexsvpuwgn.supabase.co';
const validKey = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhY2JzaGNtZ3JqZXhzdnB1d2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxOTI1NjAsImV4cCI6MjA3Nzc2ODU2MH0.1-TvO37dJS8YvU_gkOpFpZlIx_0U-ebEEMrjqtBW5Og';

export const supabase = createClient(validUrl, validKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: window.localStorage,
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Wrapper para queries con manejo automático de errores de sesión
export const supabaseQuery = async (queryFn, retries = 1) => {
  try {
    const result = await queryFn();

    // Si hay error relacionado con JWT o autenticación
    if (result.error) {
      const errorMessage = result.error.message.toLowerCase();
      
      if (
        errorMessage.includes('jwt') ||
        errorMessage.includes('expired') ||
        errorMessage.includes('invalid') ||
        result.error.code === 'PGRST301'
      ) {
        console.warn("Auth error detected, attempting to refresh session...");

        // Intentar refrescar la sesión
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();

        if (refreshError || !session) {
          console.error("Session refresh failed, signing out...");
          await supabase.auth.signOut();
          window.location.href = '/login';
          return { data: null, error: refreshError || new Error('Session expired') };
        }

        // Reintentar la query original si quedan reintentos
        if (retries > 0) {
          console.log("Retrying query after session refresh...");
          await new Promise(resolve => setTimeout(resolve, 500)); // Esperar 500ms
          return supabaseQuery(queryFn, retries - 1);
        }
      }

      return result;
    }

    return result;
  } catch (error) {
    console.error("Exception in supabaseQuery:", error);
    return { data: null, error };
  }
};

// Helper para verificar si la sesión es válida
export const isSessionValid = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return false;
    }

    // Verificar si el token ha expirado
    const expiresAt = session.expires_at;
    const now = Math.floor(Date.now() / 1000);
    
    return expiresAt > now;
  } catch (error) {
    console.error("Error checking session validity:", error);
    return false;
  }
};