'use client';

import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { AuthContext } from './auth-context';
import { createSupabaseBrowserClient, signOutUser } from './supabase/client';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    // Get initial session - keep it simple
    const getInitialSession = async () => {
      try {
        console.log('[AuthProvider] Getting initial session...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('[AuthProvider] Error getting session:', error);
        } else {
          console.log('[AuthProvider] Initial session:', session?.user?.email || 'No session');
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('[AuthProvider] Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthProvider] Auth state changed:', event, session?.user?.email || 'No session');
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle sign out cleanup
        if (event === 'SIGNED_OUT') {
          await signOutUser();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Sign out from Supabase client
      await supabase.auth.signOut();
      
      // Clear client storage
      await signOutUser();
      
      // Clear server session
      const { signOut: serverSignOut } = await import('@/app/actions/auth');
      await serverSignOut();
      
      // Clear local state
      setUser(null);
      setSession(null);
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if there's an error, redirect to login
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Error refreshing session:', error);
        // If refresh fails, sign out
        await signOut();
      } else if (session) {
        // Update server session with new tokens
        const { createSession } = await import('@/app/actions/auth');
        await createSession(
          session.access_token,
          session.refresh_token,
          session.expires_at || Date.now() + (60 * 60 * 1000)
        );
        setSession(session);
        setUser(session?.user ?? null);
      }
    } catch (error) {
      console.error('Error in refreshSession:', error);
      await signOut();
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
