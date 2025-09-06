import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function GET() {
  try {
    console.log('[FORCE-SIGNOUT] Starting force signout process...');
    
    // Clear the Supabase session
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    
    // Clear all possible auth-related cookies aggressively
    const cookieStore = await cookies();
    
    // Get all current cookies
    const allCookies = cookieStore.getAll();
    console.log('[FORCE-SIGNOUT] Found cookies:', allCookies.map(c => c.name));
    
    // Clear every single cookie that might be auth-related
    allCookies.forEach(cookie => {
      if (cookie.name.includes('supabase') || 
          cookie.name.includes('auth') || 
          cookie.name.includes('sb-') ||
          cookie.name.includes('session') ||
          cookie.name.includes('manitomanita') ||
          cookie.name === 'session') {
        
        console.log('[FORCE-SIGNOUT] Clearing cookie:', cookie.name);
        
        // Set to expired
        cookieStore.set(cookie.name, '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 0,
          expires: new Date(0),
          path: '/'
        });
        
        // Also delete
        cookieStore.delete(cookie.name);
      }
    });
    
    // Also clear common auth cookie names that might not be present
    const potentialAuthCookies = [
      'session',
      'supabase-auth-token',
      'manitomanita.auth.token',
      'sb-access-token',
      'sb-refresh-token'
    ];
    
    potentialAuthCookies.forEach(cookieName => {
      cookieStore.set(cookieName, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        expires: new Date(0),
        path: '/'
      });
      cookieStore.delete(cookieName);
    });
    
    console.log('[FORCE-SIGNOUT] All cookies cleared, redirecting to login...');
    
  } catch (error) {
    console.error('[FORCE-SIGNOUT] Error during logout:', error);
  }
  
  // Redirect to login
  redirect('/login');
}
