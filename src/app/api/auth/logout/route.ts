import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function POST() {
  try {
    // Clear the Supabase session
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    
    // Clear all possible auth-related cookies
    const cookieStore = await cookies();
    
    // Clear session cookie with all possible configurations
    cookieStore.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      expires: new Date(0),
      path: '/'
    });
    
    // Also delete the cookie
    cookieStore.delete('session');
    
    // Clear any Supabase auth cookies that might exist
    ['sb-access-token', 'sb-refresh-token', 'supabase-auth-token', 'supabase.auth.token', 'manitomanita.auth.token'].forEach(cookieName => {
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
    
    // Clear any other potential auth cookies
    const allCookies = cookieStore.getAll();
    allCookies.forEach(cookie => {
      if (cookie.name.includes('supabase') || 
          cookie.name.includes('auth') || 
          cookie.name.includes('sb-') ||
          cookie.name.includes('session') ||
          cookie.name.includes('manitomanita')) {
        cookieStore.set(cookie.name, '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 0,
          expires: new Date(0),
          path: '/'
        });
        cookieStore.delete(cookie.name);
      }
    });

  } catch (error) {
    console.error('API logout error:', error);
  }
  
  // Always redirect to login after logout
  redirect('/login');
}

export async function GET() {
  // Also handle GET requests for logout
  return POST();
}
