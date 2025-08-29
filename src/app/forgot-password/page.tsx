'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      toast({
        variant: 'destructive',
        title: 'Email Required',
        description: 'Please enter your email address.',
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: 'Password Reset Email Sent',
        description: 'Check your inbox for a link to reset your password. If you don\'t see it, check your spam folder.',
      });
      router.push('/login');
    } catch (error: any) {
      console.error('Password Reset Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error Sending Email',
        description: error.message || 'Could not send password reset email. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center py-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-headline">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <Button onClick={handleResetPassword} disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </Button>
           <div className="mt-4 text-center text-sm">
              Remember your password?{' '}
              <Link href="/login" className="underline text-accent">
                Login
              </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
