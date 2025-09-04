import {NextRequest, NextResponse} from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register', 
  '/forgot-password',
  '/reset-password',
  '/privacy',
  '/terms',
  '/auth/callback'
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
  '/reset-password'
];

async function validateSession(token: string): Promise<boolean> {
  try {
    console.log(`[Middleware] Validating token: ${token?.substring(0, 20)}...`);
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } }
    });
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    const isValid = !error && !!user;
    console.log(`[Middleware] Session validation: ${isValid ? 'VALID' : 'INVALID'}`, { 
      hasUser: !!user, 
      error: error?.message,
      tokenPreview: token?.substring(0, 20) + '...'
    });
    
    return isValid;
  } catch (error) {
    console.error('[Middleware] Session validation error:', error);
    return false;
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
  const isValidSession = await validateSession(sessionCookie);
  
  if (!isValidSession) {
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

  // If user is logged in with valid session
  if (isValidSession) {
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
