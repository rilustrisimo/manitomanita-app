import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
// Header removed - using global header from layout
import ProfileAvatar from '@/components/profile-avatar';
import type { Member } from '@/lib/types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar, Users, Gift, ChevronLeft, Copy, Bot, LogIn } from 'lucide-react';
import WishlistEditor from '@/components/wishlist-editor';
import ShuffleButton from '../../../components/ShuffleButton';

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

export const dynamic = 'force-dynamic';

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { id: gid } = await params;

  const { data: userRes } = await supabase.auth.getUser();
  const currentUser = { id: userRes.user?.id ?? '', name: userRes.user?.user_metadata?.full_name ?? 'Friend' } as any;

  // Try to fetch the group row; allow a brief retry in case we're landing here immediately after creation
  let { data: groupRow, error: groupErr } = await supabase
    .from('groups')
    .select('*')
    .eq('id', gid)
    .maybeSingle();

  if (!groupRow) {
    // Brief retry to account for any transient read lag or policy propagation
    await new Promise((r) => setTimeout(r, 350));
    const retry = await supabase.from('groups').select('*').eq('id', gid).maybeSingle();
    groupRow = retry.data ?? null as any;
    groupErr = retry.error ?? groupErr;
  }

  if (!groupRow) {
    console.error('[GroupPage] Group not found or not accessible', { gid, error: groupErr });
    notFound();
  }

  const { data: ms, error: msErr } = await supabase
    .from('memberships')
    .select('user_id, role, assigned_pair_user_id')
    .eq('group_id', gid);
  if (msErr) {
    console.error('[GroupPage] memberships read error (continuing with minimal data)', msErr);
  }

  const memberIds = (ms ?? []).map((m) => m.user_id).filter(Boolean);
  let profs: any[] | null = [];
  if (memberIds.length > 0) {
    const { data } = await supabase
      .from('user_profiles')
      .select('id, email, screen_name, profile_image_url')
      .in('id', memberIds);
    profs = data ?? [];
  }

  const members: Member[] = (profs ?? []).map((p) => ({
    id: p.id,
    name: p.screen_name,
    screenName: p.screen_name,
    avatarUrl: '', // Deprecated field, now using profileImagePath
    profileImagePath: p.profile_image_url,
    isModerator: (ms ?? []).find((x) => x.user_id === p.id)?.role === 'moderator',
    wishlist: [],
    comments: [],
  }));

  const group = {
    id: groupRow.id,
    name: groupRow.group_name,
    exchangeDate: groupRow.gift_exchange_date,
    spendingMinimum: Number(groupRow.spending_minimum),
    isPro: false,
    matchingCompleted: groupRow.is_matched,
    members,
    matches: Object.fromEntries(
      (ms ?? [])
        .map((x) => [x.user_id, x.assigned_pair_user_id] as const)
        .filter(([, v]) => !!v)
    ),
  } as any;

  const moderator = group.members.find((m: any) => m.isModerator);
  const currentUserIsMember = group.members.some((m: any) => m.id === currentUser.id);
  const currentUserIsModerator = group.members.find((m: any) => m.id === currentUser.id)?.isModerator ?? false;
  const recipientId = group.matches?.[currentUser.id];
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

