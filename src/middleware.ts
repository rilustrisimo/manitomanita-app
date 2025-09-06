import {NextRequest, NextResponse} from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register', 
  '/forgot-password',
  '/auth/forgot-password',
  '/reset-password',
  '/auth/reset-password',
  '/privacy',
  '/terms',
  '/auth/callback',
  '/debug-auth',
  '/force-logout'
];

// Define route patterns that should be public
const publicRoutePatterns = [
  /^\/join\/[^\/]+$/,  // Matches /join/{id}
  /^\/.well-known\//,  // Well-known endpoints
  /^\/\.well-known\//, // Some environments prefix with a dot
  /^\/favicon\//       // Favicon directory and files
];

// Define auth routes that should redirect to dashboard if already logged in
const authRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/auth/forgot-password',
  '/reset-password',
  '/auth/reset-password'
];

async function validateSession(sessionCookie: string): Promise<{ isValid: boolean; newSessionData?: any }> {
  try {
    let sessionData;
    try {
      sessionData = JSON.parse(sessionCookie);
    } catch (error) {
      console.error('[Middleware] Failed to parse session cookie:', error);
      return { isValid: false };
    }
    
    const { access_token, refresh_token, expires_at } = sessionData;
    
    if (!access_token) {
      console.log('[Middleware] No access token in session');
      return { isValid: false };
    }
    
    console.log(`[Middleware] Validating token: ${access_token?.substring(0, 20)}...`);
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    // Create Supabase client and set the session properly
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    });
    
    // Set the session with both tokens
    const { data: sessionResult, error: sessionError } = await supabase.auth.setSession({
      access_token,
      refresh_token
    });
    
    // If session setting succeeded and we have a user, it's valid
    if (!sessionError && sessionResult.user) {
      console.log(`[Middleware] Session validation: VALID`, { 
        hasUser: !!sessionResult.user, 
        tokenPreview: access_token?.substring(0, 20) + '...'
      });
      
      // If we got refreshed tokens, return them
      if (sessionResult.session && sessionResult.session.access_token !== access_token) {
        console.log('[Middleware] Session was refreshed during validation');
        const newSessionData = {
          access_token: sessionResult.session.access_token,
          refresh_token: sessionResult.session.refresh_token,
          expires_at: sessionResult.session.expires_at || Date.now() + (60 * 60 * 1000)
        };
        return { isValid: true, newSessionData };
      }
      
      return { isValid: true };
    }
    
    console.log(`[Middleware] Session validation: INVALID`, { 
      hasUser: !!sessionResult?.user, 
      error: sessionError?.message || 'Auth session missing!',
      tokenPreview: access_token?.substring(0, 20) + '...'
    });
    
    return { isValid: false };
  } catch (error) {
    console.error('[Middleware] Session validation error:', error);
    return { isValid: false };
  }
}

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  console.log(`[Middleware] ${pathname} - Session cookie: ${sessionCookie ? 'EXISTS' : 'MISSING'}`);

  // Check if the current route is public
  const isPublicRoute = publicRoutes.includes(pathname) || 
                       publicRoutePatterns.some(pattern => pattern.test(pathname));
  const isAuthRoute = authRoutes.includes(pathname);
  
  console.log(`[Middleware] ${pathname} - Public route: ${isPublicRoute}, Auth route: ${isAuthRoute}`);

  // If no session cookie exists
  if (!sessionCookie) {
    console.log(`[Middleware] No session cookie - Public route: ${isPublicRoute}`);
    // Allow access to public routes
    if (isPublicRoute) {
      return NextResponse.next();
    }
    // Redirect to login for protected routes
    console.log(`[Middleware] Redirecting to login for protected route: ${pathname}`);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If session cookie exists, validate it
  const { isValid, newSessionData } = await validateSession(sessionCookie);
  
  if (!isValid) {
    console.log(`[Middleware] Invalid session, clearing cookie and redirecting to login`);
    // Session is invalid, clear the cookie and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      expires: new Date(0),
      path: '/'
    });
    return response;
  }

  // If we got new session data from refresh, update the cookie
  if (newSessionData) {
    console.log('[Middleware] Updating session cookie with refreshed token');
    const response = NextResponse.next();
    response.cookies.set('session', JSON.stringify(newSessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });
    return response;
  }

  // If user is logged in with valid session
  if (isValid) {
    console.log(`[Middleware] Valid session - Auth route: ${isAuthRoute}`);
    // Redirect away from auth pages to dashboard
    if (isAuthRoute) {
      console.log(`[Middleware] Redirecting authenticated user from auth page to dashboard`);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Allow access to all other routes
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
