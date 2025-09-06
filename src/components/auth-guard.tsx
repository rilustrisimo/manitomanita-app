'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface AuthGuardProps {
  children: React.ReactNode;
  loadingMessage?: string;
  loginMessage?: string;
  loginDescription?: string;
}

export function AuthGuard({ 
  children, 
  loadingMessage = "Loading...",
  loginMessage = "Please log in",
  loginDescription = "Sign in to access this page and manage your account."
}: AuthGuardProps) {
  const { user, loading: authLoading } = useAuth();

  // Show loading during auth check
  if (authLoading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
        <main className="container mx-auto px-6 py-12 pt-28 max-w-7xl">
          <div className="flex justify-center items-center py-24">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border-0 p-12 shadow-lg shadow-gray-200/50">
              <div className="flex flex-col items-center space-y-4">
                <LoadingSpinner size="lg" />
                {loadingMessage && (
                  <p className="text-gray-600 text-lg">{loadingMessage}</p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
        <main className="container mx-auto px-6 py-12 pt-28 max-w-7xl">
          <div className="flex flex-col items-center justify-center py-24">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border-0 p-12 shadow-2xl shadow-gray-200/50 text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-r from-[#3ec7c2]/10 to-[#3ec7c2]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogIn className="h-8 w-8 text-[#3ec7c2]" />
              </div>
              <h2 className="text-2xl font-bold text-[#1b1b1b] mb-3">{loginMessage}</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">{loginDescription}</p>
              <Button 
                asChild 
                className="bg-gradient-to-r from-[#3ec7c2] to-[#3ec7c2]/90 hover:from-[#3ec7c2]/90 hover:to-[#3ec7c2]/80 text-white font-semibold px-8 py-3 h-12 rounded-2xl shadow-lg shadow-[#3ec7c2]/25 hover:shadow-[#3ec7c2]/40 transition-all duration-300 transform hover:scale-[1.02] border-0"
              >
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
}
