import {NextRequest, NextResponse} from 'next/server';
import {auth} from '@/lib/firebase-admin';

export async function middleware(request: NextRequest) {
  const session = request.cookies().get('session')?.value;

  if (!session) {
    // If no session cookie, redirect to login page
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  try {
    // Verify the session cookie
    const decodedIdToken = await auth.verifySessionCookie(session, true);
    request.headers.set('X-User-ID', decodedIdToken.uid);

    // If trying to access login/register while authenticated, redirect to dashboard
    if (
      request.nextUrl.pathname === '/login' ||
      request.nextUrl.pathname === '/register'
    ) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next({
      headers: {
        'X-User-ID': decodedIdToken.uid,
      },
    });
  } catch (error) {
    // Session cookie is invalid. Clear it and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('session');
    return response;
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
