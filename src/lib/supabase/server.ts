import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export const createSupabaseServerClient = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const token = (await cookies()).get('session')?.value;
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    global: {
      headers: {
        apikey: supabaseAnonKey,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  });
};
