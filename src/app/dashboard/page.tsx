'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, LogIn } from 'lucide-react';
import GroupCard from '@/components/group-card';
import { useAuth } from '@/lib/auth-context';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading';
import { Group } from '@/lib/types';
import { getProfileImageUrl } from '@/lib/profile-image';

// Skeleton component for loading groups
function GroupCardSkeleton() {
  return (
    <div className="group cursor-pointer">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border-0 p-8 animate-pulse shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-300 transform hover:scale-[1.02]">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="h-7 bg-gradient-to-r from-gray-200 to-gray-100 rounded-2xl w-32"></div>
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full w-20"></div>
          </div>
          
          {/* Date and info */}
          <div className="space-y-3">
            <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-100 rounded-xl w-28"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-24"></div>
          </div>
          
          {/* Members section */}
          <div className="space-y-3">
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-20"></div>
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 w-10 bg-gradient-to-br from-gray-200 to-gray-100 rounded-full ring-3 ring-white"></div>
              ))}
            </div>
          </div>
          
          {/* Status badges */}
          <div className="flex flex-wrap gap-2">
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full w-24"></div>
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full w-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupsLoaded, setGroupsLoaded] = useState(false);

  useEffect(() => {
    async function fetchGroups() {
      if (!user || authLoading) {
        return;
      }

      setGroupsLoading(true);
      
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
        setGroupsLoading(false);
        setGroupsLoaded(true);
      }
    }

    fetchGroups();
  }, [user, authLoading]);

  // Show minimal loading only for initial auth
  if (authLoading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
        <main className="container mx-auto px-6 py-12 pt-28 max-w-7xl">
          <div className="flex justify-center items-center py-24">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border-0 p-12 shadow-lg shadow-gray-200/50">
              <LoadingSpinner size="lg" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
        <main className="container mx-auto px-6 py-12 pt-28 max-w-7xl">
          <div className="flex flex-col items-center justify-center py-24">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border-0 p-12 shadow-2xl shadow-gray-200/50 text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-r from-[#3ec7c2]/10 to-[#3ec7c2]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogIn className="h-8 w-8 text-[#3ec7c2]" />
              </div>
              <h2 className="text-2xl font-bold text-[#1b1b1b] mb-3">Please log in</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">Sign in to view your dashboard and manage your gift exchange groups.</p>
              <Button 
                asChild 
                className="bg-gradient-to-r from-[#3ec7c2] to-[#3ec7c2]/90 hover:from-[#3ec7c2]/90 hover:to-[#3ec7c2]/80 text-white font-semibold px-8 py-3 h-12 rounded-2xl shadow-lg shadow-[#3ec7c2]/25 hover:shadow-[#3ec7c2]/40 transition-all duration-300 transform hover:scale-[1.02] border-0"
              >
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const firstName = user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
      <main className="container mx-auto px-6 py-12 pt-28 max-w-7xl">
        {/* Header section - shows immediately */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 space-y-6 lg:space-y-0">
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-bold font-headline bg-gradient-to-r from-[#1b1b1b] to-[#1b1b1b]/80 bg-clip-text text-transparent">
              Welcome back, {firstName}!
            </h1>
            <p className="text-lg text-gray-600 font-medium">Here are your active gift exchange groups.</p>
          </div>
          <Button 
            asChild 
            className="bg-gradient-to-r from-[#3ec7c2] to-[#3ec7c2]/90 hover:from-[#3ec7c2]/90 hover:to-[#3ec7c2]/80 text-white font-semibold px-8 py-3 h-12 rounded-2xl shadow-lg shadow-[#3ec7c2]/25 hover:shadow-[#3ec7c2]/40 transition-all duration-300 transform hover:scale-[1.02] border-0"
          >
            <Link href="/groups/new" className="flex items-center space-x-2">
              <PlusCircle className="h-5 w-5" />
              <span>Create New Group</span>
            </Link>
          </Button>
        </div>

        {/* Groups section - shows skeleton while loading */}
        {groupsLoading && !groupsLoaded ? (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <GroupCardSkeleton key={i} />
            ))}
          </div>
        ) : groupsLoaded ? (
          <>
            {groups.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {groups.map((group) => (
                  <GroupCard key={group.id} group={group} userId={user.id} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl border-0 p-12 shadow-2xl shadow-gray-200/50 text-center max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#3ec7c2]/10 to-[#3ec7c2]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <PlusCircle className="h-8 w-8 text-[#3ec7c2]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#1b1b1b] mb-3">No groups yet!</h2>
                  <p className="text-gray-600 mb-8 leading-relaxed">Get started by creating a new group for your friends or colleagues.</p>
                  <Button 
                    asChild 
                    className="bg-gradient-to-r from-[#3ec7c2] to-[#3ec7c2]/90 hover:from-[#3ec7c2]/90 hover:to-[#3ec7c2]/80 text-white font-semibold px-8 py-3 h-12 rounded-2xl shadow-lg shadow-[#3ec7c2]/25 hover:shadow-[#3ec7c2]/40 transition-all duration-300 transform hover:scale-[1.02] border-0"
                  >
                    <Link href="/groups/new" className="flex items-center space-x-2">
                      <PlusCircle className="h-5 w-5" />
                      <span>Create New Group</span>
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex justify-center items-center py-24">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border-0 p-8 shadow-lg shadow-gray-200/50">
              <LoadingSpinner size="lg" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
