import {NextRequest, NextResponse} from 'next/server';
import {auth as firebaseAuth} from 'firebase-admin';
import {cookies} from 'next/headers';
import {jose} from 'jose';

// This is a simplified middleware that only handles redirection.
// The actual session verification should happen in a server component or API route.
export async function middleware(request: NextRequest) {
  const sessionCookie = cookies().get('session')?.value;

  const isAuthPage =
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/register';

  // If there's no session and the user is trying to access a protected route, redirect to login.
  if (!sessionCookie && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If there IS a session, and the user tries to access an auth page, redirect them to the dashboard.
  if (sessionCookie && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
