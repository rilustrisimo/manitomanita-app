'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getProfileImageUrl, getInitials } from '@/lib/profile-image';
import { cn } from '@/lib/utils';

interface ProfileAvatarProps {
  userId: string;
  profileImagePath?: string | null;
  displayName: string;
  className?: string;
  fallbackClassName?: string;
}

export default function ProfileAvatar({
  userId,
  profileImagePath,
  displayName,
  className,
  fallbackClassName
}: ProfileAvatarProps) {
  const imageUrl = getProfileImageUrl(userId, profileImagePath, displayName);
  const initials = getInitials(displayName);

  return (
    <Avatar className={cn('', className)}>
      <AvatarImage src={imageUrl} alt={displayName} />
      <AvatarFallback className={cn('bg-accent text-accent-foreground', fallbackClassName)}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
