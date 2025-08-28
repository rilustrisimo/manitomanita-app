'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function NewGroupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [groupName, setGroupName] = useState('');
  const [exchangeDate, setExchangeDate] = useState<Date | undefined>();
  const [spendingMinimum, setSpendingMinimum] = useState('');

  const handleCreateGroup = () => {
    // Basic validation
    if (!groupName || !exchangeDate || !spendingMinimum) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill out all fields to create a group.",
      });
      return;
    }
    
    // Here you would typically handle form submission,
    // e.g., call a server action to create the group in the database.
    // For now, we'll just show a success toast and redirect.

    console.log('Creating group:', { groupName, exchangeDate, spendingMinimum });
    
    toast({
      title: "Group Created!",
      description: `"${groupName}" has been successfully created.`,
    });

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen w-full bg-secondary">
      <Header />
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Create a New Gift Exchange Group</CardTitle>
            <CardDescription>Fill in the details below to get your group started.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                placeholder="e.g., Office Holiday Party 2024"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exchange-date">Exchange Date</Label>
                 <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !exchangeDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {exchangeDate ? format(exchangeDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={exchangeDate}
                      onSelect={setExchangeDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="spending-minimum">Spending Minimum (₱)</Label>
                <Input
                  id="spending-minimum"
                  type="number"
                  placeholder="e.g., 1000"
                  value={spendingMinimum}
                  onChange={(e) => setSpendingMinimum(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
             <Button variant="ghost" asChild>
                <Link href="/dashboard">Cancel</Link>
             </Button>
            <Button onClick={handleCreateGroup}>Create Group</Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
