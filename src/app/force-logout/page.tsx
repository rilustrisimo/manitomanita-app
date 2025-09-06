'use client';

import { useEffect } from 'react';
import { clearSupabaseClient } from '@/lib/supabase/client';

export default function ForceLogoutPage() {
  useEffect(() => {
    const forceLogout = async () => {
      try {
        console.log('Starting force logout...');
        
        // 1. Clear all local storage immediately
        clearSupabaseClient();
        
        // 2. Clear all possible auth storage
        if (typeof window !== 'undefined') {
          // Clear all localStorage
          Object.keys(localStorage).forEach(key => {
            if (key.includes('supabase') || key.includes('auth') || key.includes('session') || key.includes('manitomanita')) {
              localStorage.removeItem(key);
            }
          });
          
          // Clear all sessionStorage
          Object.keys(sessionStorage).forEach(key => {
            if (key.includes('supabase') || key.includes('auth') || key.includes('session') || key.includes('manitomanita')) {
              sessionStorage.removeItem(key);
            }
          });
          
          // Clear all cookies (limited by browser security)
          document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
          });
        }
        
        console.log('Storage cleared, redirecting...');
        
        // 3. Force redirect without using router (which might be cached)
        setTimeout(() => {
          window.location.href = '/api/auth/force-signout';
        }, 1000);
        
      } catch (error) {
        console.error('Force logout error:', error);
        // Force reload anyway
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
    };

    forceLogout();
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-50/50 flex items-center justify-center">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border-0 p-12 shadow-2xl shadow-gray-200/50 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-gradient-to-r from-red-500/10 to-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-500/30 border-t-red-500"></div>
        </div>
        <h2 className="text-2xl font-bold text-[#1b1b1b] mb-3">Signing out...</h2>
        <p className="text-gray-600 leading-relaxed">Clearing all session data and redirecting to login.</p>
      </div>
    </div>
  );
}
