'use client';

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Logo from '@/components/logo'
import { createSession } from '@/app/actions/auth';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.417 44 30.836 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

function RegisterForm() {
  return (
    <form action="/dashboard">
      <div className="grid gap-4">
        <div className="grid gap-2">
            <Label htmlFor="full-name">Full Name</Label>
            <Input id="full-name" placeholder="Alex Doe" required />
        </div>
        <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" required />
        </div>
        <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" />
        </div>
        <Button type="submit" className="w-full">
          Create account
        </Button>
      </div>
    </form>
  )
}

function SocialSignInForm() {
    const router = useRouter();
    const { toast } = useToast();

    const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (user) {
        const token = await user.getIdToken();
        await createSession(token);
        router.push('/dashboard');
      } else {
        throw new Error("No user found after sign in");
      }
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error.message || "There was an error signing in with Google.",
      });
    }
  };

  return (
    <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
      <GoogleIcon className="mr-2 h-4 w-4" />
      Sign up with Google
    </Button>
  )
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
        <Card className="w-full max-w-sm">
            <CardHeader className="space-y-2 text-center">
                <div className="flex justify-center py-4">
                    <Logo />
                </div>
                <CardTitle className="text-2xl font-headline">Create an account</CardTitle>
                <CardDescription>Enter your information to create an account</CardDescription>
            </CardHeader>
            <CardContent>
                <RegisterForm />
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                <SocialSignInForm />
                <div className="mt-4 text-center text-sm">
                  Already have an account?{' '}
                  <Link href="/login" className="underline text-accent">
                      Login
                  </Link>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
