import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Users, Crown } from 'lucide-react';
import type { Group } from '@/lib/types';

interface GroupCardProps {
  group: Group;
}

export default function GroupCard({ group }: GroupCardProps) {
  const membersToShow = group.members.slice(0, 5);

  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="font-headline text-xl">{group.name}</CardTitle>
          {group.isPro && <Badge variant="outline" className="text-accent border-accent"><Crown className="w-4 h-4 mr-1"/> PRO</Badge>}
        </div>
        <CardDescription className="flex items-center gap-2 pt-2">
          <Calendar className="w-4 h-4" />
          Exchange Date: {new Date(group.exchangeDate).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{group.members.length} Members</span>
          </div>
          <div className="flex -space-x-2 overflow-hidden">
            {membersToShow.map((member) => (
              <Avatar key={member.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                <AvatarImage src={member.avatarUrl} />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
            {group.members.length > 5 && (
              <Avatar className="relative flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium ring-2 ring-background">
                +{group.members.length - 5}
              </Avatar>
            )}
          </div>
        </div>
        {group.matchingCompleted ? (
          <Badge className="mt-4" variant="secondary">Matching Complete</Badge>
        ) : (
          <Badge className="mt-4" variant="secondary">Matching Pending</Badge>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/groups/${group.id}`}>
            View Group <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
