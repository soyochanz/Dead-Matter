import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/lib/mySupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoaded, setAuthLoaded] = useState(false);

  // Use a ref to track mount status to avoid state updates on unmounted component
  const isMounted = useRef(true);

  // Helper to safely set state
  const safeSetState = useCallback((setter, value) => {
    if (isMounted.current) {
      setter(value);
    }
  }, []);

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Error fetching profile:', error.message);
        return null;
      }

      if (isMounted.current) {
        // Deep compare to prevent unnecessary re-renders
        if (JSON.stringify(data) !== JSON.stringify(profile)) {
          setProfile(data);
        }
      }
      return data;
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      return null;
    }
  }, [profile]); // Add profile to dependency since we use it for comparison

  const handleSession = useCallback(async (currentSession) => {
    if (!isMounted.current) return;

    try {
      if (currentSession) {
        // Check if session is expired
        const expiresAt = currentSession.expires_at;
        const now = Math.floor(Date.now() / 1000);

        if (expiresAt && expiresAt < now) {
          console.log('Session expired, attempting refresh...');
          const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
          if (error || !refreshedSession) {
            throw new Error('Session refresh failed');
          }
          currentSession = refreshedSession;
        }

        // Optimization: If session is identical, skip updates
        if (session?.access_token === currentSession?.access_token) {
          // still fetch profile if needed in case it changed independently?
          // better to rely on realtime subs for profile changes, for now just prevent heavy re-render
          // Actually, we skip setting session/user, but we might want to ensure profile is fetched if missing
          if (!profile) {
            await fetchProfile(currentSession.user.id);
          }
          // Stop here to prevent context churn
          return;
        }

        safeSetState(setSession, currentSession);
        safeSetState(setUser, currentSession?.user ?? null);

        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        }
      } else {
        // Handle logout / no session
        if (session) { // only update if we actually had a session before
          safeSetState(setSession, null);
          safeSetState(setUser, null);
          safeSetState(setProfile, null);
        }
      }
    } catch (error) {
      console.error('Error handling session:', error);
      safeSetState(setSession, null);
      safeSetState(setUser, null);
      safeSetState(setProfile, null);
    } finally {
      safeSetState(setAuthLoaded, true);
      safeSetState(setLoading, false);
    }
  }, [fetchProfile, safeSetState, session, profile]); // Add session/profile deps


  useEffect(() => {
    isMounted.current = true;
    let authListener = null;
    let timeoutId = null;

    const initializeAuth = async () => {
      try {
        // 1. Set a safety timeout to prevent infinite loading
        // If Supabase doesn't respond within 5 seconds, we assume offline or error and stop loading
        timeoutId = setTimeout(() => {
          if (isMounted.current && loading) {
            console.warn('Auth check timed out. Forcing loading to false.');
            safeSetState(setLoading, false);
            safeSetState(setAuthLoaded, true);
            // Optional: Toast notification if debugging
            // toast({ title: "Connection Slow", description: "Checking authentication is taking longer than expected." });
          }
        }, 5000);

        // 2. Get the initial session
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        // 3. Process the initial session
        await handleSession(data.session);

        // 4. Set up the auth state listener
        const { data: listener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          console.log(`Auth event: ${event}`);

          if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
            await handleSession(newSession);
          } else if (event === 'SIGNED_OUT') {
            await handleSession(null);
          } else if (event === 'USER_UPDATED') {
            if (isMounted.current) {
              safeSetState(setUser, newSession?.user ?? null);
              safeSetState(setSession, newSession);
            }
          } else if (event === 'INITIAL_SESSION') {
            // handled by getSession usually, but good fallback
            await handleSession(newSession);
          }
        });

        authListener = listener.subscription;

      } catch (error) {
        console.error('Auth initialization error:', error);
        // In case of error, ensure we stop loading state so app doesn't hang
        if (isMounted.current) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
          setAuthLoaded(true);
        }
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "There was a problem checking your login status. Please try logging in again.",
        });
      } finally {
        // Clear timeout if operation completes
        if (timeoutId) clearTimeout(timeoutId);
      }
    };

    initializeAuth();

    return () => {
      isMounted.current = false;
      if (authListener) authListener.unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [handleSession, toast, safeSetState]);

  const signUp = useCallback(async (email, password, options) => {
    try {
      safeSetState(setLoading, true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Sign up error:", error);
      return { data: null, error };
    } finally {
      if (isMounted.current) safeSetState(setLoading, false);
    }
  }, [safeSetState]);

  const signIn = useCallback(async (email, password) => {
    try {
      safeSetState(setLoading, true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Sign in error:", error);
      return { data: null, error };
    } finally {
      if (isMounted.current) safeSetState(setLoading, false);
    }
  }, [safeSetState]);

  const signOut = useCallback(async () => {
    try {
      console.log('Initiating sign out protocol...');
      safeSetState(setLoading, true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase sign out error:', error);
        throw error;
      }
      console.log('Sign out successful, cleaning up session.');
      // State update handled by onAuthStateChange -> SIGNED_OUT
      // But we call handleSession(null) as extra safety to ensure UI updates immediately
      await handleSession(null);
    } catch (error) {
      console.error("Sign out process failed:", error);
      toast({
        variant: "destructive",
        title: "Sign out Failed",
        description: error.message,
      });
      // Force local cleanup if network signout fails to ensure user isn't stuck "logged in"
      console.log('Forcing local session termination after error.');
      await handleSession(null);
    } finally {
      if (isMounted.current) safeSetState(setLoading, false);
    }
  }, [toast, handleSession, safeSetState]);

  const value = useMemo(() => ({
    user,
    session,
    profile,
    loading,
    authLoaded,
    signUp,
    signIn,
    signOut,
    fetchProfile,
    isAdmin: profile?.role === 'admin' || profile?.role === 'superadmin',
  }), [user, session, profile, loading, authLoaded, signUp, signIn, signOut, fetchProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
