'use server';

import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';

export async function createSession(token: string) {
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
  const options = {
    name: 'session',
    value: token,
    maxAge: expiresIn,
    httpOnly: true,
    secure: true,
  };
  cookies().set(options);
  redirect('/dashboard');
}

export async function signOut() {
  cookies().delete('session');
  redirect('/login');
}
