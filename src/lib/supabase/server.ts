import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export const createSupabaseServerClient = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  const sessionCookie = (await cookies()).get('session')?.value;
  let sessionData = null;
  
  if (sessionCookie) {
    try {
      sessionData = JSON.parse(sessionCookie);
    } catch (error) {
      console.error('[Server] Failed to parse session cookie:', error);
    }
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    global: {
      headers: {
        apikey: supabaseAnonKey,
        ...(sessionData?.access_token ? { Authorization: `Bearer ${sessionData.access_token}` } : {}),
      },
    },
  });
};
