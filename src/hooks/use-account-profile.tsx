'use client';

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';

interface AccountProfile {
  id: string;
  user_id: string;
  display_name: string;
  phone?: string;
  contact_details?: string;
  profile_image_url?: string | null;
}

export function useAccountProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchProfile() {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const supabase = createSupabaseBrowserClient();
        
        const { data, error } = await supabase
          .from('account_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!isMounted) return;

        if (error && error.code !== 'PGRST116') {
          console.error('Profile fetch error:', error);
          setProfile(null);
        } else if (data) {
          setProfile(data as AccountProfile);
        } else {
          // No profile found, create a basic one from auth user data
          const basicProfile: AccountProfile = {
            id: '',
            user_id: user.id,
            display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            phone: user.user_metadata?.phone,
            contact_details: undefined,
            profile_image_url: user.user_metadata?.avatar_url || null
          };
          setProfile(basicProfile);
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
        if (isMounted) setProfile(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return { profile, loading };
}
