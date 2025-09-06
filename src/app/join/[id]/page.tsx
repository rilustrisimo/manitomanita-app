'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { createSession } from '@/app/actions/auth';
import { joinGroup } from '@/app/actions/join-group';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LoadingButton } from '@/components/ui/loading-button';
import { Users, Gift, Calendar, ArrowRight, CheckCircle } from 'lucide-react';

interface GroupInfo {
  id: string;
  group_name: string;
  moderator_name: string;
  gift_exchange_date: string;
  spending_minimum: number;
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" {...props} className="w-5 h-5">
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

export default function JoinGroupPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { toast } = useToast();
  const [groupId, setGroupId] = useState<string>('');
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [step, setStep] = useState<'welcome' | 'auth' | 'screen-name' | 'success'>('welcome');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [initialized, setInitialized] = useState(false);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [screenName, setScreenName] = useState('');

  useEffect(() => {
    if (initialized) return; // Prevent multiple executions
    
    const initialize = async () => {
      const resolvedParams = await params;
      setGroupId(resolvedParams.id);
      
      const supabase = createSupabaseBrowserClient();
      
      // Check if user is already authenticated
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      // Fetch group info first to ensure group exists
      try {
        const response = await fetch(`/api/groups/${resolvedParams.id}/public`);
        
        if (response.ok) {
          const group = await response.json();
          setGroupInfo(group);
        } else {
          console.error('Failed to fetch group info:', response.status);
          toast({
            variant: "destructive",
            title: "Group Not Found",
            description: "The group you're trying to join doesn't exist or is no longer available.",
          });
          setLoading(false);
          setInitialized(true);
          return;
        }
      } catch (error) {
        console.error('Error fetching group:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load group information. Please try again.",
        });
        setLoading(false);
        setInitialized(true);
        return;
      }
      
      // If user is authenticated, check if they're already a member
      if (user) {
        try {
          // First get their user_profiles entry
          const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('main_user_id', user.id)
            .eq('email', user.email!)
            .maybeSingle() as { data: { id: string } | null };

          if (userProfile?.id) {
            const { data: membership, error: membershipError } = await supabase
              .from('memberships')
              .select('id')
              .eq('group_id', resolvedParams.id)
              .eq('user_id', userProfile.id)
              .maybeSingle();

            if (membership && !membershipError) {
              // User is already a member, redirect to group page immediately
              setRedirecting(true);
              toast({
                title: "Already a Member",
                description: "You're already part of this group. Redirecting...",
              });
              setTimeout(() => {
                router.replace(`/groups/${resolvedParams.id}`);
              }, 100); // Small delay to prevent race conditions
              return;
            }
          }
        } catch (error) {
          // User is not a member, continue with normal flow
          console.log('User is not a member of this group');
        }
        
        // User is authenticated but not a member, go to screen name step
        setStep('screen-name');
      } else {
        // User is not authenticated, show welcome screen
        setStep('welcome');
      }
      
      setLoading(false);
      setInitialized(true);
    };

    initialize();
  }, [params, toast, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      
      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast({
            variant: "destructive",
            title: "Login Failed",
            description: error.message,
          });
          return;
        }

        if (data.session) {
          await createSession(
            data.session.access_token,
            data.session.refresh_token,
            data.session.expires_at || Date.now() + (60 * 60 * 1000)
          );
          setCurrentUser(data.user);
          setStep('screen-name');
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          toast({
            variant: "destructive",
            title: "Registration Failed",
            description: error.message,
          });
          return;
        }

        if (data.session && data.user) {
          await createSession(
            data.session.access_token,
            data.session.refresh_token,
            data.session.expires_at || Date.now() + (60 * 60 * 1000)
          );
          setCurrentUser(data.user);
          setStep('screen-name');
        } else {
          toast({
            title: "Check Your Email",
            description: "Please check your email and click the confirmation link to complete registration. After confirming, you can return to this link to join the group.",
          });
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!screenName.trim()) {
      toast({
        variant: "destructive",
        title: "Screen Name Required",
        description: "Please enter how you'd like to appear to other group members.",
      });
      return;
    }

    setSubmitting(true);
    try {
      await joinGroup(groupId, screenName.trim());
      setStep('success');
      
      toast({
        title: "Welcome to the Group!",
        description: `You've successfully joined "${groupInfo?.group_name}".`,
      });
      
      // Redirect after a delay to ensure the user sees the success message
      setTimeout(() => {
        router.push(`/dashboard`);
      }, 1500);
      
    } catch (error) {
      console.error('Join error:', error);
      toast({
        variant: "destructive",
        title: "Failed to Join",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!groupInfo) return;
    
    setSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      
      // Store the group ID in localStorage to retrieve after OAuth redirect
      localStorage.setItem('pendingGroupJoin', groupId);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Google Sign-in Failed",
          description: error.message,
        });
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to initiate Google sign-in. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || redirecting) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100">
        <main className="container mx-auto max-w-md px-4 py-8 pt-24">
          <div className="flex items-center justify-center h-40">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-slate-600">
                {redirecting ? "Redirecting to your group..." : "Loading group information..."}
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!groupInfo) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100">
        <main className="container mx-auto max-w-md px-4 py-8 pt-24">
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <Gift className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-[#1b1b1b]">Group Not Found</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-slate-600 mb-6">
                The group you're trying to join doesn't exist or is no longer available.
              </p>
              <Button asChild className="w-full">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100">
      <main className="container mx-auto max-w-md px-4 py-8 pt-24">
        {/* Group Information Card */}
        <Card className="mb-6 border-0 shadow-xl bg-gradient-to-br from-[#1b1b1b] to-slate-800 text-white">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#3ec7c2] flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">{groupInfo.group_name}</CardTitle>
                <CardDescription className="text-slate-300">
                  Gift Exchange Invitation
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Users className="w-4 h-4 text-[#3ec7c2]" />
              <span>Hosted by {groupInfo.moderator_name}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-[#3ec7c2]" />
              <span>Exchange: {new Date(groupInfo.gift_exchange_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="w-4 h-4 flex items-center justify-center text-[#3ec7c2] font-bold">₱</span>
              <span>Budget: ₱{groupInfo.spending_minimum} minimum</span>
            </div>
          </CardContent>
        </Card>

        {/* Welcome Step */}
        {step === 'welcome' && (
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#3ec7c2] to-teal-400 flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-semibold text-[#1b1b1b]">Join the Fun!</CardTitle>
              <CardDescription className="text-slate-600">
                Sign in or create an account to join this gift exchange
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => setStep('auth')}
                className="w-full h-12 bg-gradient-to-r from-[#1b1b1b] to-slate-700 hover:from-[#2a2a2a] hover:to-slate-600 text-white rounded-xl font-medium"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Authentication Step */}
        {step === 'auth' && (
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-semibold text-[#1b1b1b]">
                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </CardTitle>
              <CardDescription className="text-slate-600">
                {authMode === 'login' 
                  ? 'Sign in to join the gift exchange' 
                  : 'Create your account to get started'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-xl border-slate-200 focus:border-[#3ec7c2] focus:ring-[#3ec7c2]"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 rounded-xl border-slate-200 focus:border-[#3ec7c2] focus:ring-[#3ec7c2]"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                
                <LoadingButton 
                  type="submit" 
                  loading={submitting}
                  className="w-full h-12 bg-gradient-to-r from-[#1b1b1b] to-slate-700 hover:from-[#2a2a2a] hover:to-slate-600 text-white rounded-xl font-medium"
                >
                  {authMode === 'login' ? 'Sign In' : 'Create Account'}
                </LoadingButton>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 text-slate-500">Or continue with</span>
                  </div>
                </div>
                
                <LoadingButton
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  loading={submitting}
                  className="w-full h-12 rounded-xl border-slate-200 hover:bg-slate-50"
                >
                  <GoogleIcon />
                  <span className="ml-2">Google</span>
                </LoadingButton>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                    className="text-sm text-[#3ec7c2] hover:underline"
                  >
                    {authMode === 'login' 
                      ? "Don't have an account? Sign up" 
                      : "Already have an account? Sign in"
                    }
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Screen Name Step */}
        {step === 'screen-name' && (
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#3ec7c2] to-teal-400 flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-semibold text-[#1b1b1b]">Choose Your Screen Name</CardTitle>
              <CardDescription className="text-slate-600">
                How would you like other group members to see you?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="screen-name" className="text-sm font-medium text-slate-700">Screen Name</Label>
                <Input
                  id="screen-name"
                  type="text"
                  value={screenName}
                  onChange={(e) => setScreenName(e.target.value)}
                  className="h-11 rounded-xl border-slate-200 focus:border-[#3ec7c2] focus:ring-[#3ec7c2]"
                  placeholder="Enter your screen name"
                  maxLength={50}
                  required
                />
                <p className="text-xs text-slate-500">
                  This is how you'll appear to other members in the group
                </p>
              </div>
              
              <LoadingButton 
                onClick={handleJoinGroup}
                loading={submitting}
                disabled={!screenName.trim()}
                className="w-full h-12 bg-gradient-to-r from-[#3ec7c2] to-teal-400 hover:from-teal-500 hover:to-teal-500 text-white rounded-xl font-medium"
              >
                Join Gift Exchange
                <ArrowRight className="w-4 h-4 ml-2" />
              </LoadingButton>
            </CardContent>
          </Card>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-semibold text-[#1b1b1b]">Welcome to the Group!</CardTitle>
              <CardDescription className="text-slate-600">
                You've successfully joined "{groupInfo.group_name}"
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-slate-600">
                  You can now participate in the gift exchange and manage your wishlist.
                </p>
              </div>
              
              <Button 
                onClick={() => router.push(`/dashboard`)}
                className="w-full h-12 bg-gradient-to-r from-[#1b1b1b] to-slate-700 hover:from-[#2a2a2a] hover:to-slate-600 text-white rounded-xl font-medium"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
