'use client';

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
import { Calendar, Crown, Copy, Shuffle, Users, Gift, Bot, MessageSquare, Link as LinkIcon, LogIn, LogOut, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react';
import GiftSuggester from '@/components/ai/gift-suggester';
import WishlistEditor from '@/components/wishlist-editor';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';


function RecipientCard({ recipient }: { recipient: Member }) {
  return (
    <Card className="bg-background">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Gift className="w-6 h-6 text-accent" />
          Your Assigned Manito
        </CardTitle>
        <CardDescription>
          You are the secret santa for {recipient.screenName}. Here's their wishlist to help you find the perfect gift!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4 mb-6">
          <Avatar className="h-16 w-16 border-2 border-accent">
            <AvatarImage src={recipient.avatarUrl} alt={recipient.screenName} />
            <AvatarFallback>{recipient.screenName.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-bold">{recipient.screenName}</h3>
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
                  {item.links && item.links.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {item.links.map((link, index) => (
                        <Link key={index} href={link} target="_blank" className="text-sm text-accent hover:underline flex items-center gap-1">
                           <LinkIcon className="w-3 h-3" />
                           Reference Link {item.links && item.links.length > 1 ? index + 1 : ''}
                        </Link>
                      ))}
                    </div>
                  )}
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

function MemberDetailsModal({ member }: { member: Member }) {
  return (
    <DialogContent className="sm:max-w-xl">
      <DialogHeader>
        <DialogTitle className="font-headline flex items-center gap-4">
           <Avatar className="h-12 w-12 border">
            <AvatarImage src={member.avatarUrl} alt={member.screenName} />
            <AvatarFallback>{member.screenName.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <span>{member.screenName}'s Wishlist</span>
        </DialogTitle>
      </DialogHeader>
      <div className="py-4 space-y-6">
        {member.wishlist.length > 0 ? (
          <ScrollArea className="h-[50vh] pr-6">
            <ul className="space-y-4">
              {member.wishlist.map(item => (
                <li key={item.id} className="p-4 border rounded-md bg-secondary/50 space-y-3">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    {item.links && item.links.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {item.links.map((link, index) => (
                          <Link key={index} href={link} target="_blank" className="text-sm text-accent hover:underline flex items-center gap-1">
                            <LinkIcon className="w-3 h-3" />
                            Reference Link {item.links.length > 1 ? index + 1 : ''}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`comment-${item.id}`} className="text-xs font-semibold flex items-center gap-1.5"><MessageSquare className="w-3 h-3" /> Leave a comment on this item</Label>
                    <Textarea id={`comment-${item.id}`} placeholder="e.g., 'Is this the right color?' or 'Great idea!'" rows={2} />
                    <Button size="sm" variant="outline">Submit Comment</Button>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        ) : (
          <p className="text-muted-foreground text-center py-8">This member's wishlist is empty.</p>
        )}

        <Separator />

        <div className="space-y-2">
          <h4 className="font-semibold font-headline flex items-center gap-2"><MessageSquare className="w-5 h-5 text-accent"/>General Comment</h4>
          <Label htmlFor={`general-comment-${member.id}`} className="text-sm text-muted-foreground">Leave a general comment or word of encouragement for {member.screenName}.</Label>
          <Textarea id={`general-comment-${member.id}`} placeholder="e.g., 'Happy holidays!' or 'Excited for the exchange!'" rows={3} />
          <Button>Submit General Comment</Button>
        </div>
      </div>
    </DialogContent>
  );
}


function MembersList({ members, isPro }: { members: Member[], isPro: boolean }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredMembers = useMemo(() => {
    return members
      .filter(member => {
        if (filter === 'all') return true;
        if (filter === 'has-wishlist') return member.wishlist.length > 0;
        if (filter === 'no-wishlist') return member.wishlist.length === 0;
        return true;
      })
      .filter(member => 
        member.screenName.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [members, searchTerm, filter]);

  return (
    <div className="space-y-4">
       <div className="space-y-4">
        <Input
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="has-wishlist">Has Wishlist</TabsTrigger>
            <TabsTrigger value="no-wishlist">No Wishlist</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Wishlist</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map(member => (
               <Dialog key={member.id}>
                <DialogTrigger asChild>
                    <TableRow className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.avatarUrl} alt={member.screenName} />
                            <AvatarFallback>{member.screenName.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.screenName}</p>
                            {member.isModerator && <Badge variant="secondary" className="text-xs">Moderator</Badge>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {member.wishlist.length > 0 ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs">Complete</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-muted-foreground">
                             <XCircle className="w-4 h-4" />
                             <span className="text-xs">Empty</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                </DialogTrigger>
                <MemberDetailsModal member={member} />
              </Dialog>
            ))}
             {filteredMembers.length === 0 && (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                    No members found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}


export default function GroupPage({ params }: { params: { id: string } }) {
  const group = mockGroups.find(g => g.id === params.id);
  const currentUser = mockUser;

  if (!group) {
    notFound();
  }

  const currentUserIsMember = group.members.some(m => m.id === currentUser.id);
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
                <div className="flex items-center gap-1"><span className="font-bold text-lg">₱</span> Min. Spend: {group.spendingMinimum}</div>
                <div className="flex items-center gap-1"><Users className="w-4 h-4" /> {group.members.length} Members</div>
              </div>
            </div>
            <div className="flex gap-2">
              {!currentUserIsMember && <Button><LogIn className="mr-2 h-4 w-4" />Join Group</Button>}
              {currentUserIsMember && <Button variant="outline"><LogOut className="mr-2 h-4 w-4" />Leave Group</Button>}

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
              </>
            ) : (
              <Card>
                 <CardHeader>
                  <CardTitle className="font-headline">Join Group to Participate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">You must join this group to add items to your wishlist, participate in the gift exchange, and see other members' wishlists.</p>

                  <Button className="mt-4"><LogIn className="mr-2 h-4 w-4" />Join Group</Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-headline">Members ({group.members.length})</h2>
            <MembersList members={group.members} isPro={group.isPro} />
          </div>
        </div>
      </main>
    </div>
  );
}

    