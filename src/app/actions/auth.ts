'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function signUpWithEmail(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;

  if (!email || !password || !fullName) {
    return { error: 'All fields are required' };
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_BASE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user && !data.user.email_confirmed_at) {
    return { 
      success: true, 
      message: 'Please check your email to verify your account before signing in.' 
    };
  }

  return { success: true, user: data.user };
}

export async function signInWithEmail(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Don't create server session here - let the client handle it naturally
  // The middleware will create the server session when needed
  
  return { success: true, user: data.user, session: data.session };
}

export async function signInWithGoogle() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_BASE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function resetPassword(formData: FormData) {
  const email = formData.get('email') as string;

  if (!email) {
    return { error: 'Email is required' };
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_BASE_URL}/auth/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { 
    success: true, 
    message: 'Password reset email sent. Please check your inbox.' 
  };
}

export async function updatePassword(formData: FormData) {
  const password = formData.get('password') as string;

  if (!password) {
    return { error: 'Password is required' };
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: 'Password updated successfully' };
}

// Session management functions
export async function createSession(accessToken: string, refreshToken: string, expiresAt: number) {
  console.log('[createSession] Creating session with refresh capability');
  
  // Store both access and refresh tokens with proper expiration
  const sessionData = {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: expiresAt
  };
  
  // Set session cookie to expire when the refresh token expires (7 days by default in Supabase)
  const refreshTokenExpiresIn = 60 * 60 * 24 * 7; // 7 days in seconds
  const options = {
    name: 'session',
    value: JSON.stringify(sessionData),
    maxAge: refreshTokenExpiresIn,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/'
  };
  
  try {
    (await cookies()).set(options as any);
    console.log('[createSession] Session cookie set successfully with refresh token');
    return { success: true };
  } catch (error) {
    console.error('[createSession] Failed to set session cookie:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getCurrentUser() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return { user: null, profile: null };
    }

    // Get the user profile
    const { data: profile } = await supabase
      .from('account_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return { 
      user: {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata
      }, 
      profile 
    };
  } catch (error) {
    console.error('[getCurrentUser] Error:', error);
    return { user: null, profile: null };
  }
}

export async function getSessionToken() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie?.value) {
      return null;
    }
    
    try {
      const sessionData = JSON.parse(sessionCookie.value);
      return sessionData.access_token || null;
    } catch (parseError) {
      console.error('[getSessionToken] Failed to parse session cookie:', parseError);
      return null;
    }
  } catch (error) {
    console.error('[getSessionToken] Error:', error);
    return null;
  }
}

export async function validateServerSession() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie?.value) {
      return { isValid: false, user: null, error: 'No session cookie' };
    }
    
    let sessionData;
    try {
      sessionData = JSON.parse(sessionCookie.value);
    } catch (parseError) {
      console.error('[validateServerSession] Failed to parse session cookie:', parseError);
      return { isValid: false, user: null, error: 'Invalid session format' };
    }
    
    if (!sessionData.access_token) {
      return { isValid: false, user: null, error: 'No access token' };
    }
    
    // Create Supabase client and set the session
    const supabase = await createSupabaseServerClient();
    
    // Set the session on the Supabase client
    const { data: { user }, error } = await supabase.auth.setSession({
      access_token: sessionData.access_token,
      refresh_token: sessionData.refresh_token
    });
    
    if (error || !user) {
      return { isValid: false, user: null, error: error?.message || 'Invalid session' };
    }
    
    return { isValid: true, user, error: null };
  } catch (error) {
    console.error('[validateServerSession] Error:', error);
    return { isValid: false, user: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function signOut() {
  try {
    // Clear the Supabase session first
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
    
    // Clear any other potential auth cookies with various naming conventions
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
    console.error('Error during logout:', error);
  }

  redirect('/login');
}
