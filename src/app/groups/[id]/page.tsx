import { notFound } from 'next/navigation';
import Header from '@/components/header';
import { mockGroups, mockUser } from '@/lib/data';
import type { Member } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar, Crown, Copy, Shuffle, Users, Gift, Bot, MessageSquare, DollarSign } from 'lucide-react';
import GiftSuggester from '@/components/ai/gift-suggester';
import WishlistEditor from '@/components/wishlist-editor';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';

function MemberCard({ member, isPro }: { member: Member, isPro: boolean }) {
  return (
    <Card>
      <CardContent className="p-4 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={member.avatarUrl} alt={member.name} />
            <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{member.name}</p>
            {member.isModerator && <Badge variant="secondary">Moderator</Badge>}
          </div>
        </div>
        {isPro && (
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 mt-1 text-muted-foreground" />
              <div className="w-full">
                <Textarea placeholder={`Leave an anonymous comment for ${member.name}...`}/>
                <Button size="sm" variant="outline" className="mt-2">Send Comment</Button>
              </div>
            </div>
             {member.comments.length > 0 && (
               <div className="pl-6 space-y-2">
                {member.comments.map((comment, i) => (
                  <p key={i} className="text-sm text-muted-foreground italic">"{comment.text}"</p>
                ))}
               </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function RecipientCard({ recipient }: { recipient: Member }) {
  return (
    <Card className="bg-background">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Gift className="w-6 h-6 text-accent" />
          Your Assigned Manito
        </CardTitle>
        <CardDescription>
          You are the secret santa for {recipient.name}. Here's their wishlist to help you find the perfect gift!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4 mb-6">
          <Avatar className="h-16 w-16 border-2 border-accent">
            <AvatarImage src={recipient.avatarUrl} alt={recipient.name} />
            <AvatarFallback>{recipient.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-bold">{recipient.name}</h3>
            <p className="text-muted-foreground">Go get 'em a nice gift!</p>
          </div>
        </div>

        <Separator className="my-6" />

        <div>
          <h4 className="text-lg font-semibold font-headline mb-4">Their Wishlist</h4>
          {recipient.wishlist.length > 0 ? (
            <ul className="space-y-3">
              {recipient.wishlist.map(item => (
                <li key={item.id} className="p-4 border rounded-md">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  {item.link && <Link href={item.link} target="_blank" className="text-sm text-accent hover:underline">Reference Link</Link>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">This person hasn't added anything to their wishlist yet.</p>
          )}
        </div>

        <Separator className="my-6" />
        <GiftSuggester recipient={recipient} />
      </CardContent>
    </Card>
  )
}


export default function GroupPage({ params }: { params: { id: string } }) {
  const group = mockGroups.find(g => g.id === params.id);
  const currentUser = mockUser;

  if (!group) {
    notFound();
  }

  const currentUserIsModerator = group.members.find(m => m.id === currentUser.id)?.isModerator ?? false;
  const currentUserWishlist = group.members.find(m => m.id === currentUser.id)?.wishlist ?? [];
  
  const recipientId = group.matches?.[currentUser.id];
  const recipient = group.members.find(m => m.id === recipientId);

  return (
    <div className="min-h-screen bg-secondary">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Group Header */}
        <section>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold font-headline">{group.name}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground mt-2">
                <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Exchange: {new Date(group.exchangeDate).toLocaleDateString()}</div>
                <div className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> Min. Spend: ${group.spendingMinimum}</div>
                <div className="flex items-center gap-1"><Users className="w-4 h-4" /> {group.members.length} Members</div>
              </div>
            </div>
            <div className="flex gap-2">
              {!group.isPro && <Button variant="outline"><Crown className="mr-2 h-4 w-4 text-accent" />Upgrade to PRO</Button>}
              {currentUserIsModerator && !group.matchingCompleted && <Button><Shuffle className="mr-2 h-4 w-4" />Start Matching</Button>}
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="invite-link" className="text-xs text-muted-foreground">Invite Link</Label>
            <div className="flex gap-2">
              <Input id="invite-link" type="text" readOnly value={`https://manitomanita.app/join/${group.id}?code=xyz123`} />
              <Button variant="outline" size="icon"><Copy className="h-4 w-4" /></Button>
            </div>
          </div>
        </section>

        <Separator />
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left/Main Column */}
          <div className="lg:col-span-2 space-y-8">
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
                  <p className="text-muted-foreground">The moderator has not started the matching process yet. Your secret assignment will appear here once matching is complete!</p>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Your Wishlist</CardTitle>
                <CardDescription>Add items you'd like to receive. Your Manito will see this list.</CardDescription>
              </CardHeader>
              <CardContent>
                <WishlistEditor initialItems={currentUserWishlist}/>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-headline">Members ({group.members.length})</h2>
            <div className="space-y-4">
              {group.members.map(member => (
                <MemberCard key={member.id} member={member} isPro={group.isPro} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
