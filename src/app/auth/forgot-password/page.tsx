'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Mail, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { resetPassword } from '@/app/actions/auth';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (formData: FormData) => {
    setIsLoading(true);
    setError('');
    setMessage('');

    const result = await resetPassword(formData);
    
    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccess(true);
      setMessage(result.message || 'Password reset email sent!');
    }
    
    setIsLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-2xl shadow-gray-200/50 rounded-3xl overflow-hidden">
            <CardHeader className="text-center space-y-4 pt-12 pb-8 px-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-semibold text-gray-900">Check your email</CardTitle>
              <CardDescription className="text-gray-600">
                We've sent you a password reset link
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              <Alert className="bg-blue-50 border-blue-200 rounded-2xl">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">{message}</AlertDescription>
              </Alert>
              <div className="bg-gray-50 p-6 rounded-2xl">
                <p className="text-sm text-gray-700 text-center leading-relaxed">
                  Please check your email and click the reset link to create a new password. 
                  The link will expire in 1 hour for security reasons.
                </p>
              </div>
            </CardContent>
            <CardFooter className="pt-4 pb-8 px-8">
              <Button asChild className="w-full h-12 bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80 text-white font-medium rounded-2xl shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all duration-200 transform hover:scale-[1.02]">
                <Link href="/login" className="flex items-center justify-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to sign in</span>
                </Link>
              </Button>
            </CardFooter>
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
          <p className="text-gray-500 text-sm">Reset your password</p>
        </div>

        {/* Main Card */}
        <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-2xl shadow-gray-200/50 rounded-3xl overflow-hidden">
          <CardHeader className="space-y-1 pb-4 pt-8 px-8">
            <CardTitle className="text-2xl font-semibold text-center text-gray-900">
              Forgot password?
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              No worries, we'll send you reset instructions
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 px-8 pb-6">
            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200 rounded-2xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <form action={handleResetPassword} className="space-y-5">
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
                <p className="text-xs text-gray-500 mt-1">
                  We'll send a password reset link to this email
                </p>
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80 text-white font-medium rounded-2xl shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all duration-200 transform hover:scale-[1.02]" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  'Send reset link'
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="pt-6 pb-8 px-8 bg-gray-50/50">
            <div className="text-sm text-center w-full text-gray-600">
              Remember your password?{' '}
              <Link href="/login" className="text-accent hover:text-accent/80 font-medium transition-colors flex items-center justify-center space-x-1 mt-2">
                <ArrowLeft className="w-3 h-3" />
                <span>Back to sign in</span>
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
