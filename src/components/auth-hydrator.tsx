import { createSupabaseServerClient } from '@/lib/supabase/server';
import { AuthProvider } from '@/lib/auth-context';

export default async function AuthHydrator({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  let initialProfile = null as any;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('account_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (profile) initialProfile = profile;
    }
  } catch (_) {}
  // Render client provider with server-known profile for instant hydration
  return (
    <AuthProvider initialProfile={initialProfile}>
      {children}
    </AuthProvider>
  );
}
