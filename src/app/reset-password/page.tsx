'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetPasswordRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the actual reset password page, preserving any query parameters
    const searchParams = new URLSearchParams(window.location.search);
    const redirectUrl = `/auth/reset-password${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    router.replace(redirectUrl);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
