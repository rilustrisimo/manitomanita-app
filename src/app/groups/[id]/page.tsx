'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import ProfileAvatar from '@/components/profile-avatar';
import type { Member } from '@/lib/types';
import { AuthGuard } from '@/components/auth-guard';
import { useAuth } from '@/lib/auth-context';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar, Users, Gift, ChevronLeft, Copy, Bot, LogIn } from 'lucide-react';
import WishlistEditor from '@/components/wishlist-editor';
import ShuffleButton from '../../../components/ShuffleButton';
import { LoadingSpinner } from '@/components/ui/loading';

function RecipientCard({ recipient }: { recipient: Member }) {
  return (
    <Card className="bg-background">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Gift className="w-6 h-6 text-accent" />
          Your Assigned Manito
        </CardTitle>
        <CardDescription>You are the secret santa for {recipient.screenName}.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4 mb-6">
          <ProfileAvatar
            userId={recipient.id}
            profileImagePath={recipient.profileImagePath}
            displayName={recipient.screenName}
            className="h-16 w-16 border-2 border-accent"
          />
          <div>
            <h3 className="text-xl font-bold">{recipient.screenName}</h3>
            <p className="text-muted-foreground">Go get 'em a nice gift!</p>
          </div>
        </div>
        <Separator className="my-6" />
        <p className="text-muted-foreground">Wishlist will appear here when available.</p>
      </CardContent>
    </Card>
  );
}

export default function GroupPage({ params }: { params: { id: string } }) {
  return (
    <AuthGuard 
      loadingMessage="Loading group details..."
      loginMessage="Please log in"
      loginDescription="Sign in to view group details and participate in the gift exchange."
    >
      <GroupPageContent params={params} />
    </AuthGuard>
  );
}

function GroupPageContent({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // At this point, user is guaranteed to exist because of AuthGuard
  if (!user) return null;

  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    async function loadGroupData() {
      try {
        const gid = params.id;
        const currentUser = { id: user!.id, name: user!.user_metadata?.full_name ?? 'Friend' };

        // Get the current user's user_profiles ID for membership comparison
        let currentUserProfileId: string | null = null;
        if (currentUser.id) {
          const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('main_user_id', currentUser.id)
            .maybeSingle();
          
          currentUserProfileId = (userProfile as any)?.id || null;
        }

        // Try to fetch the group row
        let { data: groupRow, error: groupErr } = await supabase
          .from('groups')
          .select('*')
          .eq('id', gid)
          .maybeSingle();

        if (!groupRow) {
          // Brief retry to account for any transient read lag or policy propagation
          await new Promise((r) => setTimeout(r, 350));
          const retry = await supabase.from('groups').select('*').eq('id', gid).maybeSingle();
          groupRow = retry.data ?? null;
          groupErr = retry.error ?? groupErr;
        }

        if (!groupRow) {
          console.error('[GroupPage] Group not found or not accessible', { gid, error: groupErr });
          setError('Group not found');
          setLoading(false);
          return;
        }

        const { data: ms, error: msErr } = await supabase
          .from('memberships')
          .select('user_id, role, assigned_pair_user_id')
          .eq('group_id', gid);
        
        if (msErr) {
          console.error('[GroupPage] memberships read error (continuing with minimal data)', msErr);
        }

        const memberIds = (ms ?? []).map((m: any) => m.user_id).filter(Boolean);
        let profs: any[] = [];
        if (memberIds.length > 0) {
          const { data } = await supabase
            .from('user_profiles')
            .select('id, email, screen_name, profile_image_url')
            .in('id', memberIds);
          profs = data ?? [];
        }

        const members: Member[] = profs.map((p: any) => ({
          id: p.id,
          name: p.screen_name,
          screenName: p.screen_name,
          avatarUrl: '', // Deprecated field, now using profileImagePath
          profileImagePath: p.profile_image_url,
          isModerator: ((ms as any) ?? []).find((x: any) => x.user_id === p.id)?.role === 'moderator',
          wishlist: [],
          comments: [],
        }));

        const groupData = {
          id: (groupRow as any).id,
          name: (groupRow as any).group_name,
          exchangeDate: (groupRow as any).gift_exchange_date,
          spendingMinimum: Number((groupRow as any).spending_minimum),
          isPro: false,
          matchingCompleted: (groupRow as any).is_matched,
          members,
          matches: Object.fromEntries(
            ((ms as any) ?? [])
              .map((x: any) => [x.user_id, x.assigned_pair_user_id] as const)
              .filter((item: readonly [any, any]) => !!item[1])
          ),
          currentUserProfileId,
          currentUser,
        };

        setGroup(groupData);
      } catch (error) {
        console.error('Error loading group:', error);
        setError('Failed to load group');
      } finally {
        setLoading(false);
      }
    }

    loadGroupData();
  }, [params.id, user, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary">
        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="flex justify-center items-center py-24">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border-0 p-12 shadow-lg shadow-gray-200/50">
              <LoadingSpinner size="lg" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-secondary">
        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="flex justify-center items-center py-24">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border-0 p-12 shadow-lg shadow-gray-200/50 text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Group Not Found</h2>
              <p className="text-gray-600 mb-6">{error || 'The group you are looking for does not exist or you do not have access to it.'}</p>
              <Button asChild>
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const moderator = group.members.find((m: any) => m.isModerator);
  const currentUserIsMember = group.currentUserProfileId ? group.members.some((m: any) => m.id === group.currentUserProfileId) : false;
  const currentUserIsModerator = group.currentUserProfileId ? (group.members.find((m: any) => m.id === group.currentUserProfileId)?.isModerator ?? false) : false;
  const recipientId = group.currentUserProfileId ? group.matches?.[group.currentUserProfileId] : null;
  const recipient = group.members.find((m: any) => m.id === recipientId);
  const currentUserWishlist: any[] = [];

  return (
    <div className="min-h-screen bg-secondary">
      
      <main className="container mx-auto px-4 py-8 pt-24 space-y-8">
        <Button asChild variant="outline" className="mb-4">
          <Link href="/dashboard">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to All Groups
          </Link>
        </Button>

        <section>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold font-headline">{group.name}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground mt-2">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> Exchange: {new Date(group.exchangeDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-lg">₱</span> Min. Spend: {group.spendingMinimum}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" /> {group.members.length} Members
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {currentUserIsModerator && !group.matchingCompleted && <ShuffleButton groupId={group.id} />}
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="invite-link" className="text-xs text-muted-foreground">
              Invite Link
            </Label>
            <div className="flex gap-2">
              <Input id="invite-link" type="text" readOnly value={`${process.env.NODE_ENV === 'production' ? 'https://manitomanita.app' : 'http://localhost:9002'}/join/${group.id}`} />
              <Button variant="outline" size="icon">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        <Separator />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {currentUserIsMember ? (
              <>
                {group.matchingCompleted && recipient && <RecipientCard recipient={recipient} />}

                {!group.matchingCompleted && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-headline flex items-center gap-2">
                        <Bot className="w-6 h-6 text-accent" />
                        Matching Pending
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        The moderator has not started the matching process yet. Your secret assignment will appear here
                        once matching is complete!
                      </p>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="font-headline">Your Wishlist</CardTitle>
                    <CardDescription>Add items you'd like to receive. Your Manito will see this list.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <WishlistEditor initialItems={currentUserWishlist} />
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Join Group to Participate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    You must join this group to add items to your wishlist, participate in the gift exchange, and see
                    other members' wishlists.
                  </p>

                  <Button className="mt-4" asChild>
                    <Link href={`/join/${group.id}`}>
                      <LogIn className="mr-2 h-4 w-4" />Join Group
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {moderator && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-headline">Group Moderator</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <ProfileAvatar
                      userId={moderator.id}
                      profileImagePath={moderator.profileImagePath}
                      displayName={moderator.name}
                      className="h-12 w-12"
                    />
                    <div>
                      <p className="font-semibold">{moderator.name}</p>
                      <p className="text-sm text-muted-foreground">The one in charge!</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

