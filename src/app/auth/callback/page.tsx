'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { createSession } from '@/app/actions/auth';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createSupabaseBrowserClient();
      
      try {
        // Get the session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push('/login?error=callback_failed');
          return;
        }

        if (session?.user) {
          // Create server session with the tokens
          await createSession(
            session.access_token,
            session.refresh_token,
            session.expires_at || Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour fallback
          );
          
          // Redirect to dashboard
          router.push('/dashboard');
        } else {
          // No session, redirect to login
          router.push('/login');
        }
      } catch (err) {
        console.error('Callback processing error:', err);
        router.push('/login');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-50/50 flex items-center justify-center">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border-0 p-12 shadow-2xl shadow-gray-200/50 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-gradient-to-r from-[#3ec7c2]/10 to-[#3ec7c2]/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#3ec7c2]/30 border-t-[#3ec7c2]"></div>
        </div>
        <h2 className="text-2xl font-bold text-[#1b1b1b] mb-3">Completing sign in...</h2>
        <p className="text-gray-600 leading-relaxed">Please wait while we sign you in.</p>
      </div>
    </div>
  );
}
