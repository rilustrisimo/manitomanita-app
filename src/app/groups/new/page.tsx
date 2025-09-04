'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Header removed - using global header from layout
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
import { LoadingOverlay } from '@/components/ui/loading';
import { createGroup } from '@/app/actions/create-group';

export default function NewGroupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [groupName, setGroupName] = useState('');
  const [exchangeDate, setExchangeDate] = useState<Date | undefined>();
  const [spendingMinimum, setSpendingMinimum] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Get today's date for minimum date validation
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

  const handleCreateGroup = async (formData: FormData) => {
    // Basic validation
    if (!groupName || !exchangeDate || !spendingMinimum) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill out all fields to create a group.",
      });
      return;
    }

    // Validate exchange date is not in the past
    if (exchangeDate < today) {
      toast({
        variant: "destructive",
        title: "Invalid Date",
        description: "Exchange date cannot be in the past. Please select today or a future date.",
      });
      return;
    }

    // Validate spending minimum
    const spendingAmount = Number(spendingMinimum);
    if (isNaN(spendingAmount) || spendingAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid spending minimum amount.",
      });
      return;
    }

    setIsCreating(true);
    
    try {
      // Prepare form data for server action
      const actionFormData = new FormData();
      actionFormData.append('groupName', groupName);
      actionFormData.append('exchangeDate', exchangeDate.toISOString().split('T')[0]); // YYYY-MM-DD format
      actionFormData.append('spendingMinimum', spendingAmount.toString());

      // Call server action and get the new group's id
      const newGroupId = await createGroup(actionFormData);
      
      toast({
        title: "Group Created!",
        description: `"${groupName}" has been successfully created. Redirecting...`,
      });

      // Navigate to the group dashboard page using the id
      router.push(`/groups/${newGroupId}`);
      
    } catch (error) {
      console.error('Group creation error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create group. Please try again.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-secondary">
      
      <main className="container mx-auto max-w-2xl px-4 py-8 pt-24">
        <LoadingOverlay 
          isLoading={isCreating} 
          message="Creating your group..."
        >
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Create a New Gift Exchange Group</CardTitle>
              <CardDescription>Fill in the details below to get your group started.</CardDescription>
            </CardHeader>
          <form action={handleCreateGroup}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="group-name">Group Name</Label>
                <Input
                  id="group-name"
                  name="groupName"
                  placeholder="e.g., Office Holiday Party 2024"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  required
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
                        type="button"
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
                        disabled={(date) => date < today}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spending-minimum">Spending Minimum (₱)</Label>
                  <Input
                    id="spending-minimum"
                    name="spendingMinimum"
                    type="number"
                    placeholder="e.g., 1000"
                    value={spendingMinimum}
                    onChange={(e) => setSpendingMinimum(e.target.value)}
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
               <Button variant="ghost" asChild type="button">
                  <Link href="/dashboard">Cancel</Link>
               </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Creating Group..." : "Create Group"}
              </Button>
            </CardFooter>
          </form>
        </Card>
        </LoadingOverlay>
      </main>
    </div>
  );
}
