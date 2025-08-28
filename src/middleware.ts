import {NextRequest, NextResponse} from 'next/server';

export async function middleware(request: NextRequest) {
  const session = request.cookies().get('session')?.value;

  // If there's no session cookie and the user is trying to access a protected route, redirect to login.
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If there IS a session, and the user tries to access login/register, redirect them to the dashboard.
  if (session && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
     return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Allow the request to proceed. 
  // The actual session verification for dashboard pages can happen on the page/layout itself 
  // or in API routes if needed, using `firebase-admin` in a Node.js environment.
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
