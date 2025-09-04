'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { createSession } from '@/app/actions/auth';
import { joinGroup } from '@/app/actions/join-group';
// Header removed - using global header from layout
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { LoadingOverlay } from '@/components/ui/loading';
import { Users, Gift, Calendar } from 'lucide-react';

interface GroupInfo {
  id: string;
  group_name: string;
  moderator_name: string;
  gift_exchange_date: string;
  spending_minimum: number;
}

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

export default function JoinGroupPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { toast } = useToast();
  const [groupId, setGroupId] = useState<string>('');
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerScreenName, setRegisterScreenName] = useState('');

  useEffect(() => {
    const initialize = async () => {
      const resolvedParams = await params;
      setGroupId(resolvedParams.id);
      
      const supabase = createSupabaseBrowserClient();
      
      // Check if user is already authenticated
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      // If user is authenticated, check if they're already a member
      if (user) {
        try {
          const { data: membership, error: membershipError } = await supabase
            .from('memberships')
            .select('id')
            .eq('group_id', resolvedParams.id)
            .eq('user_id', user.id)
            .single();

          if (membership && !membershipError) {
            // User is already a member, redirect to group page
            toast({
              title: "Already a Member",
              description: "You're already part of this group. Redirecting...",
            });
            router.push(`/groups/${resolvedParams.id}`);
            return;
          }
        } catch (error) {
          // User is not a member, continue with normal flow
          console.log('User is not a member of this group');
        }
      }
      
      // Fetch group info using API route to bypass RLS
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
        }
      } catch (error) {
        console.error('Error fetching group:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load group information. Please try again.",
        });
      }
      
      setLoading(false);
    };

    initialize();
  }, [params, toast, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
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
        // Create server session
        await createSession(data.session.access_token);
        
        // Check if user is already a member before joining
        const { data: existingMembership } = await supabase
          .from('memberships')
          .select('id')
          .eq('group_id', groupId)
          .eq('user_id', data.user.id)
          .single();

        if (existingMembership) {
          toast({
            title: "Already a Member",
            description: `You're already part of "${groupInfo?.group_name}".`,
          });
        } else {
          // Join the group
          await joinGroup(groupId);
          
          toast({
            title: "Welcome!",
            description: `You've successfully joined "${groupInfo?.group_name}".`,
          });
        }
        
        router.push(`/groups/${groupId}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      
      const { data, error } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
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
        // Create user profile
        const { error: profileError } = await (supabase
          .from('user_profiles') as any)
          .insert({
            id: data.user.id,
            email: registerEmail,
            screen_name: registerScreenName,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        // Create server session
        await createSession(data.session.access_token);
        
        // Join the group
        await joinGroup(groupId);
        
        toast({
          title: "Account Created!",
          description: `Welcome to "${groupInfo?.group_name}"! You've been added as a member.`,
        });
        
        router.push(`/groups/${groupId}`);
      } else {
        toast({
          title: "Check Your Email",
          description: "Please check your email and click the confirmation link to complete registration. After confirming, you can return to this link to join the group.",
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: "destructive",
        title: "Error",
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

  const handleJoinAsExistingUser = async () => {
    if (!currentUser) return;
    
    setSubmitting(true);
    try {
      await joinGroup(groupId);
      
      toast({
        title: "Joined Successfully!",
        description: `You've been added to "${groupInfo?.group_name}" as a member.`,
      });
      
      router.push(`/groups/${groupId}`);
    } catch (error) {
      console.error('Join error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to join the group. You might already be a member.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-secondary">
        
        <main className="container mx-auto max-w-md px-4 py-8 pt-24">
          <LoadingOverlay isLoading={true} message="Loading group information...">
            <div></div>
          </LoadingOverlay>
        </main>
      </div>
    );
  }

  if (!groupInfo) {
    return (
      <div className="min-h-screen w-full bg-secondary">
        
        <main className="container mx-auto max-w-md px-4 py-8 pt-24">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Group Not Found</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                The group you're trying to join doesn't exist or is no longer available.
              </p>
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-secondary">
      
      <main className="container mx-auto max-w-md px-4 py-8 pt-24">
        <LoadingOverlay isLoading={submitting} message="Processing...">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Gift className="w-6 h-6 text-accent" />
                Join Gift Exchange
              </CardTitle>
              <CardDescription>
                You've been invited to join "{groupInfo.group_name}"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Hosted by {groupInfo.moderator_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Exchange Date: {new Date(groupInfo.gift_exchange_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">₱</span>
                  <span>Minimum Spend: ₱{groupInfo.spending_minimum}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {currentUser ? (
            <Card>
              <CardHeader>
                <CardTitle>Join as {currentUser.email}</CardTitle>
                <CardDescription>
                  You're already logged in. Click below to join this group as a member.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleJoinAsExistingUser} disabled={submitting} className="w-full">
                  {submitting ? "Joining..." : "Join Group"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Create Account</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Login to Join</CardTitle>
                    <CardDescription>
                      Sign in with your existing account to join the group.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input
                          id="login-email"
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <Input
                          id="login-password"
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" disabled={submitting} className="w-full">
                        {submitting ? "Logging in..." : "Login & Join Group"}
                      </Button>
                      
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGoogleSignIn}
                        disabled={submitting}
                        className="w-full"
                      >
                        <GoogleIcon />
                        Continue with Google
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Create Account & Join</CardTitle>
                    <CardDescription>
                      Create a new account to join the gift exchange.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-screen-name">Display Name</Label>
                        <Input
                          id="register-screen-name"
                          type="text"
                          value={registerScreenName}
                          onChange={(e) => setRegisterScreenName(e.target.value)}
                          placeholder="How others will see you"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-email">Email</Label>
                        <Input
                          id="register-email"
                          type="email"
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-password">Password</Label>
                        <Input
                          id="register-password"
                          type="password"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" disabled={submitting} className="w-full">
                        {submitting ? "Creating Account..." : "Create Account & Join"}
                      </Button>
                      
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGoogleSignIn}
                        disabled={submitting}
                        className="w-full"
                      >
                        <GoogleIcon />
                        Continue with Google
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </LoadingOverlay>
      </main>
    </div>
  );
}
