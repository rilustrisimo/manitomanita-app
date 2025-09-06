'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { updatePassword } from '@/app/actions/auth';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change in reset password:', event, !!session);
      
      if (session) {
        console.log('Session established for password reset');
        setSessionReady(true);
        setError('');
      } else if (event === 'SIGNED_OUT') {
        console.log('No session found for password reset');
        setError('Invalid or expired reset link. Please request a new password reset.');
      }
    });

    // Also check immediately for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('Found existing session immediately');
        setSessionReady(true);
        setError('');
      } else {
        console.log('No immediate session, waiting for auth state change...');
        // Set a timeout in case no auth state change occurs
        setTimeout(() => {
          if (!sessionReady) {
            setError('Invalid or expired reset link. Please request a new password reset.');
          }
        }, 3000);
      }
    };

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [sessionReady]);

  const handleUpdatePassword = async (formData: FormData) => {
    if (!sessionReady) {
      setError('Session not ready. Please wait or try again.');
      return;
    }

    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Use client-side Supabase for password update during reset flow
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err) {
      setError('An error occurred while updating your password. Please try again.');
    }
    
    setIsLoading(false);
  };

  // Show loading while session is being established
  if (!sessionReady && !error) {
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
          </div>
          
          <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-2xl shadow-gray-200/50 rounded-3xl overflow-hidden">
            <CardHeader className="text-center space-y-4 pt-12 pb-12 px-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-[#3ec7c2]/10 to-[#3ec7c2]/20 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#3ec7c2]/30 border-t-[#3ec7c2] rounded-full animate-spin"></div>
              </div>
              <CardTitle className="text-2xl font-semibold text-gray-900">
                Verifying reset link...
              </CardTitle>
              <CardDescription className="text-gray-600">
                Please wait while we verify your password reset link
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-2xl shadow-gray-200/50 rounded-3xl overflow-hidden">
            <CardHeader className="text-center space-y-4 pt-12 pb-8 px-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-[#3ec7c2] to-[#3ec7c2]/80 rounded-full flex items-center justify-center shadow-lg shadow-[#3ec7c2]/25">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-semibold text-gray-900">Password updated!</CardTitle>
              <CardDescription className="text-gray-600">
                Your password has been successfully updated
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-12">
              <Alert className="bg-gradient-to-r from-[#3ec7c2]/10 to-[#3ec7c2]/5 border-[#3ec7c2]/30 rounded-2xl">
                <CheckCircle className="h-4 w-4 text-[#3ec7c2]" />
                <AlertDescription className="text-[#1b1b1b] font-medium">
                  Password updated successfully. Redirecting to sign in...
                </AlertDescription>
              </Alert>
              <div className="flex justify-center">
                <div className="w-6 h-6 border-2 border-[#3ec7c2]/30 border-t-[#3ec7c2] rounded-full animate-spin"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show error state for invalid/expired links
  if (error && !sessionReady) {
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
          </div>
          
          <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-2xl shadow-gray-200/50 rounded-3xl overflow-hidden">
            <CardHeader className="text-center space-y-4 pt-12 pb-8 px-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-400/10 to-red-500/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <CardTitle className="text-2xl font-semibold text-gray-900">
                Reset link invalid
              </CardTitle>
              <CardDescription className="text-gray-600">
                This password reset link is invalid or has expired
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              <Alert variant="destructive" className="bg-red-50 border-red-200 rounded-2xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
              <div className="text-center">
                <Button 
                  asChild 
                  className="w-full h-12 bg-gradient-to-r from-[#3ec7c2] to-[#3ec7c2]/90 hover:from-[#3ec7c2]/90 hover:to-[#3ec7c2]/80 text-white font-medium rounded-2xl shadow-lg shadow-[#3ec7c2]/25 hover:shadow-[#3ec7c2]/40 transition-all duration-200 transform hover:scale-[1.02]"
                >
                  <a href="/auth/forgot-password">Request new reset link</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
          <p className="text-gray-500 text-sm">Create a new password</p>
        </div>

        {/* Main Card */}
        <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-2xl shadow-gray-200/50 rounded-3xl overflow-hidden">
          <CardHeader className="space-y-4 pb-4 pt-8 px-8">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-[#3ec7c2]/10 to-[#3ec7c2]/20 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-[#3ec7c2]" />
            </div>
            <CardTitle className="text-2xl font-semibold text-center text-gray-900">
              Set new password
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Choose a strong password for your account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 px-8 pb-8">
            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200 rounded-2xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <form action={handleUpdatePassword} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  New password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your new password"
                  required
                  disabled={isLoading || !sessionReady}
                  minLength={6}
                  className="h-12 rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#3ec7c2] focus:ring-[#3ec7c2]/20 transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                  required
                  disabled={isLoading || !sessionReady}
                  minLength={6}
                  className="h-12 rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#3ec7c2] focus:ring-[#3ec7c2]/20 transition-all duration-200"
                />
              </div>
              <div className="bg-blue-50 p-4 rounded-2xl">
                <p className="text-xs text-blue-800 leading-relaxed">
                  • Password must be at least 6 characters long<br/>
                  • Use a mix of letters, numbers, and symbols for better security<br/>
                  • Avoid using personal information
                </p>
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-[#3ec7c2] to-[#3ec7c2]/90 hover:from-[#3ec7c2]/90 hover:to-[#3ec7c2]/80 text-white font-medium rounded-2xl shadow-lg shadow-[#3ec7c2]/25 hover:shadow-[#3ec7c2]/40 transition-all duration-200 transform hover:scale-[1.02]" 
                disabled={isLoading || !sessionReady}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Updating password...</span>
                  </div>
                ) : (
                  'Update password'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
