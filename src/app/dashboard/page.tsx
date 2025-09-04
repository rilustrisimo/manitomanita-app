'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import GroupCard from '@/components/group-card';
import { useAuth } from '@/lib/auth-context';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading';
import { Group } from '@/lib/types';
import { getProfileImageUrl } from '@/lib/profile-image';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGroups() {
      if (!user || authLoading) {
        console.log('No user or auth loading, waiting...');
        return;
      }

      try {
        console.log('Fetching groups for user:', user.id);
        const supabase = createSupabaseBrowserClient();

        // Fetch groups where the user is the moderator (directly using auth user ID)
        const { data: modGroups, error: modGroupsError } = await supabase
          .from('groups')
          .select('*')
          .eq('moderator_user_id', user.id);

        if (modGroupsError) {
          console.error('Error fetching moderator groups:', modGroupsError);
        }

        // Fetch groups where the user is a member (through user_profiles)
        // First get all user_profiles for this auth user
        const { data: userProfiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('main_user_id', user.id);

        if (profilesError) {
          console.error('Error fetching user profiles:', profilesError);
        }

        let memberGroups: any[] = [];
        if (userProfiles && userProfiles.length > 0) {
          const profileIds = (userProfiles as any[]).map(p => p.id);
          
          // Get memberships for these profiles
          const { data: memberships, error: membershipError } = await supabase
            .from('memberships')
            .select(`
              group_id,
              groups (*)
            `)
            .in('user_id', profileIds);

          if (membershipError) {
            console.error('Error fetching memberships:', membershipError);
          } else {
            memberGroups = (memberships as any[] ?? [])
              .map(m => m.groups)
              .filter(Boolean);
          }
        }

        // Combine and deduplicate groups
        const allGroups = [...(modGroups ?? []), ...memberGroups];
        const uniqueGroups = allGroups.filter((group, index, self) => 
          index === self.findIndex(g => g.id === group.id)
        );

        console.log('Found groups:', uniqueGroups);

        // Process groups into the expected format
        const processedGroups: Group[] = [];
        for (const groupData of uniqueGroups) {
          const { data: membershipData } = await supabase
            .from('memberships')
            .select('user_id, role')
            .eq('group_id', groupData.id);
          
          const memberIds = (membershipData as any[] ?? []).map(m => m.user_id).filter(Boolean);
          let profiles: any[] = [];
          
          if (memberIds.length > 0) {
            const { data: profileData } = await supabase
              .from('user_profiles')
              .select('id, email, screen_name, profile_image_url')
              .in('id', memberIds);
            profiles = profileData ?? [];
          }
          
          const processedGroup: Group = {
            id: groupData.id,
            name: groupData.group_name,
            exchangeDate: groupData.gift_exchange_date,
            spendingMinimum: Number(groupData.spending_minimum),
            matchingCompleted: groupData.is_matched,
            isPro: false,
            members: profiles.map(p => ({
              id: p.id,
              name: p.screen_name,
              screenName: p.screen_name,
              avatarUrl: getProfileImageUrl(p.id, p.profile_image_url, p.screen_name),
              profileImagePath: p.profile_image_url,
              isModerator: (membershipData as any[] ?? []).find(x => x.user_id === p.id)?.role === 'moderator',
              wishlist: [],
              comments: [],
            })),
          };
          
          processedGroups.push(processedGroup);
        }

        setGroups(processedGroups);
      } catch (error) {
        console.error('Error fetching groups:', error);
        setGroups([]);
      } finally {
        setLoading(false);
      }
    }

    fetchGroups();
  }, [user, authLoading]);

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen w-full bg-secondary">
        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        </main>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen w-full bg-secondary">
        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="text-center py-20">
            <h2 className="text-xl font-semibold">Please log in to view your dashboard</h2>
            <Button asChild className="mt-4">
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const firstName = user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen w-full bg-secondary">
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold font-headline">Welcome back, {firstName}!</h1>
            <p className="text-muted-foreground">Here are your active gift exchange groups.</p>
          </div>
          <Button asChild className="mt-4 sm:mt-0">
            <Link href="/groups/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Group
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {groups.map((group) => (
                <GroupCard key={group.id} group={group} userId={user.id} />
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
          </>
        )}
      </main>
    </div>
  );
}
