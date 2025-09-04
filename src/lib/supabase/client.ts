import { createClient } from '@supabase/supabase-js';

let supabaseClient: ReturnType<typeof createClient> | null = null;

export const createSupabaseBrowserClient = () => {
  if (supabaseClient) {
    return supabaseClient;
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'manitomanita.auth.token',
      storage: {
        getItem: (key: string) => {
          if (typeof window === 'undefined') return null;
          return localStorage.getItem(key);
        },
        setItem: (key: string, value: string) => {
          if (typeof window === 'undefined') return;
          localStorage.setItem(key, value);
        },
        removeItem: (key: string) => {
          if (typeof window === 'undefined') return;
          localStorage.removeItem(key);
        },
      },
    },
  });
  
  return supabaseClient;
};

/**
 * Clear the singleton client instance and all auth tokens (useful for logout)
 */
export const clearSupabaseClient = () => {
  if (typeof window !== 'undefined') {
    // Clear all auth-related items from localStorage
    localStorage.removeItem('manitomanita.auth.token');
    localStorage.removeItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token');
    // Clear any other potential Supabase storage keys
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('auth')) {
        localStorage.removeItem(key);
      }
    });
  }
  supabaseClient = null;
};

/**
 * Sign out user and clear all tokens
 */
export const signOutUser = async () => {
  const supabase = createSupabaseBrowserClient();
  await supabase.auth.signOut();
  clearSupabaseClient();
};
