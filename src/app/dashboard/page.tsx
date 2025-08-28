import Link from 'next/link';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { mockGroups, mockUser } from '@/lib/data';
import GroupCard from '@/components/group-card';

export default function Dashboard() {
  const user = mockUser;
  const groups = mockGroups;

  return (
    <div className="min-h-screen w-full bg-secondary">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold font-headline">Welcome back, {user.name.split(' ')[0]}!</h1>
            <p className="text-muted-foreground">Here are your active gift exchange groups.</p>
          </div>
          <Button asChild className="mt-4 sm:mt-0">
            <Link href="/groups/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Group
            </Link>
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>

        {groups.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold">No groups yet!</h2>
            <p className="text-muted-foreground mt-2">Get started by creating a new group for your friends or colleagues.</p>
            <Button asChild className="mt-4">
              <Link href="/groups/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Group
              </Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
