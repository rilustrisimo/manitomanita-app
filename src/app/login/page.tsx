'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { signInWithEmail, signInWithGoogle } from '@/app/actions/auth';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleEmailLogin = async (formData: FormData) => {
    setIsLoading(true);
    setError('');
    setMessage('');

    const result = await signInWithEmail(formData);
    
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
    // Success case is handled by redirect in the action
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('An error occurred during Google sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Brand Section */}
        <div className="text-center">
                    <div className="flex items-center justify-center gap-3 mb-8">
            <Image 
              src="/logo.svg" 
              alt="ManitoManita Logo" 
              width={40} 
              height={40}
              className="w-10 h-10"
            />
            <h1 className="text-3xl font-headline">
              <span className="font-bold" style={{ color: '#1b1b1b' }}>Manito</span>
              <span className="font-bold text-[#3ec7c2]">Manita</span>
            </h1>
          </div>
          <p className="text-gray-500 text-sm">Gift exchanges made magical</p>
        </div>

        {/* Main Card */}
        <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-2xl shadow-gray-200/50 rounded-3xl overflow-hidden">
          <CardHeader className="space-y-1 pb-4 pt-8 px-8">
            <CardTitle className="text-2xl font-semibold text-center text-gray-900">
              Welcome back
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 px-8 pb-6">
            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200 rounded-2xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}
            
            {message && (
              <Alert className="bg-blue-50 border-blue-200 rounded-2xl">
                <AlertDescription className="text-blue-800">{message}</AlertDescription>
              </Alert>
            )}

            <form action={handleEmailLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                  className="h-12 rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-accent focus:ring-accent/20 transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                  className="h-12 rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-accent focus:ring-accent/20 transition-all duration-200"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80 text-white font-medium rounded-2xl shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all duration-200 transform hover:scale-[1.02]" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-gray-500 font-medium">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-2xl transition-all duration-200 transform hover:scale-[1.02]"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="font-medium text-gray-700">
                  {isLoading ? 'Signing in...' : 'Continue with Google'}
                </span>
              </div>
            </Button>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4 pt-6 pb-8 px-8 bg-gray-50/50">
            <div className="text-sm text-center">
              <Link href="/auth/forgot-password" className="text-accent hover:text-accent/80 font-medium transition-colors">
                Forgot your password?
              </Link>
            </div>
            <div className="text-sm text-center text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="text-accent hover:text-accent/80 font-medium transition-colors">
                Create one
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
