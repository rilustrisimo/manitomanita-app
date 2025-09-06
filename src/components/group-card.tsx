import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Crown, UserCheck, LogIn, ArrowRight } from 'lucide-react';
import ProfileAvatar from '@/components/profile-avatar';
import type { Group } from '@/lib/types';

interface GroupCardProps {
  group: Group;
  userId: string;
}

export default function GroupCard({ group, userId }: GroupCardProps) {
  const membersToShow = group.members.slice(0, 5);
  const currentUserIsMember = group.members.some(m => m.id === userId);
  const currentUserIsModerator = group.members.find(m => m.id === userId)?.isModerator ?? false;

  return (
    <Link 
      href={`/groups/${group.id}`}
      className="group block h-full cursor-pointer"
    >
      <div className="h-full bg-white/80 backdrop-blur-xl rounded-3xl border-0 p-8 shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-300 transform hover:scale-[1.02] flex flex-col">
        {/* Header */}
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-start">
            <h3 className="text-2xl font-bold text-[#1b1b1b] leading-tight group-hover:text-[#3ec7c2] transition-colors duration-300">
              {group.name}
            </h3>
            <div className="flex gap-2">
              {group.isPro && (
                <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 shadow-md">
                  <Crown className="w-3 h-3 mr-1"/> PRO
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-600">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-[#3ec7c2]/10 to-[#3ec7c2]/20 rounded-full">
              <Calendar className="w-4 h-4 text-[#3ec7c2]" />
            </div>
            <span className="font-medium">
              Exchange Date: {new Date(group.exchangeDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow flex flex-col gap-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-gray-600">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-[#3ec7c2]/10 to-[#3ec7c2]/20 rounded-full">
                <Users className="w-4 h-4 text-[#3ec7c2]" />
              </div>
              <span className="font-medium">{group.members.length} Members</span>
            </div>
            <div className="flex -space-x-2">
              {membersToShow.map((member) => (
                <ProfileAvatar
                  key={member.id}
                  userId={member.id}
                  profileImagePath={member.profileImagePath}
                  displayName={member.screenName}
                  className="inline-block h-10 w-10 rounded-full ring-3 ring-white shadow-md transition-transform group-hover:scale-110 duration-300"
                />
              ))}
              {group.members.length > 5 && (
                <Avatar className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#3ec7c2]/20 to-[#3ec7c2]/30 text-sm font-semibold ring-3 ring-white shadow-md text-[#3ec7c2]">
                  +{group.members.length - 5}
                </Avatar>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {currentUserIsMember ? (
              <Badge className={`${
                currentUserIsModerator 
                  ? 'bg-gradient-to-r from-[#3ec7c2] to-[#3ec7c2]/90 text-white border-0 shadow-md' 
                  : 'bg-white/60 backdrop-blur-sm text-[#1b1b1b] border border-gray-200/50'
              } font-medium px-3 py-1.5`}>
                <UserCheck className="w-3 h-3 mr-2" />
                {currentUserIsModerator ? 'Moderator' : 'Member'}
              </Badge>
            ) : (
              <Badge className="bg-white/60 backdrop-blur-sm text-gray-600 border border-gray-200/50 font-medium px-3 py-1.5">
                <LogIn className="w-3 h-3 mr-2" />
                Not a member yet
              </Badge>
            )}
            
            <Badge className={`${
              group.matchingCompleted
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-md'
                : 'bg-white/60 backdrop-blur-sm text-gray-600 border border-gray-200/50'
            } font-medium px-3 py-1.5`}>
              {group.matchingCompleted ? 'Matching Complete' : 'Matching Pending'}
            </Badge>
          </div>
        </div>

        {/* Footer Action Indicator */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100/50">
          <span className="text-[#3ec7c2] font-semibold">
            {currentUserIsMember ? 'View Group' : 'View & Join Group'}
          </span>
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-[#3ec7c2]/10 to-[#3ec7c2]/20 rounded-full group-hover:scale-110 transition-transform duration-300">
            <ArrowRight className="w-4 h-4 text-[#3ec7c2]" />
          </div>
        </div>
      </div>
    </Link>
  );
}
