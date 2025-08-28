'use server';

import { auth } from '@/lib/firebase-admin';
import {JWTPayload, SignJWT} from 'jose';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';

export async function signInWithGoogle(formData: FormData) {
  const idToken = formData.get('idToken') as string;
  if (!idToken) {
    // This should not happen if the client-side is correctly implemented
    throw new Error('idToken is missing');
  }

  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
  try {
    const sessionCookie = await auth.createSessionCookie(idToken, {expiresIn});
    const options = {
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
    };
    cookies().set(options);
    redirect('/dashboard');
  } catch (error) {
    console.error('Error creating session cookie:', error);
    // Redirect to an error page or show a message
    redirect('/login?error=auth-failed');
  }
}

export async function createSession(uid: string, payload: JWTPayload) {
  const session = await new SignJWT(payload)
    .setProtectedHeader({alg: 'HS256'})
    .setSubject(uid)
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(new TextEncoder().encode(process.env.AUTH_SECRET!));

  cookies().set('session', session, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
  });
}

export async function signOut() {
  cookies().delete('session');
  redirect('/login');
}
