import { createSupabaseBrowserClient } from '@/lib/supabase/client';

/**
 * Get the profile image URL for a user
 * @param userId - The user ID
 * @param profileImagePath - The stored profile image path
 * @param fallbackName - The name to use for generating initials fallback
 * @returns The profile image URL or fallback URL
 */
export function getProfileImageUrl(
  userId: string,
  profileImagePath?: string | null,
  fallbackName?: string
): string {
  // If there's a profile image path, return the Supabase storage URL
  if (profileImagePath) {
    const supabase = createSupabaseBrowserClient();
    const { data } = supabase.storage
      .from('profile-images')
      .getPublicUrl(profileImagePath);
    return data.publicUrl;
  }

  // Fallback to initials-based avatar
  const name = fallbackName || 'User';
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=3ec7c2&color=1b1b1b`;
}

/**
 * Get initials from a name for fallback avatar
 * @param name - The name to extract initials from
 * @returns The initials (up to 2 characters)
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Upload a profile image to Supabase storage
 * @param userId - The user ID
 * @param file - The image file to upload
 * @returns The storage path of the uploaded image
 */
export async function uploadProfileImage(
  userId: string,
  file: File
): Promise<string> {
  const supabase = createSupabaseBrowserClient();
  
  // Generate a unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}_${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  // Upload the file
  const { data, error } = await supabase.storage
    .from('profile-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  return data.path;
}

/**
 * Delete a profile image from Supabase storage
 * @param imagePath - The storage path of the image to delete
 */
export async function deleteProfileImage(imagePath: string): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  
  console.log('Attempting to delete image from storage:', imagePath);
  
  const { error } = await supabase.storage
    .from('profile-images')
    .remove([imagePath]);

  if (error) {
    console.error('Storage deletion error:', error);
    throw new Error(`Failed to delete image from storage: ${error.message}`);
  }
  
  console.log('Successfully deleted image from storage:', imagePath);
}

/**
 * Update user profile image URL in the database
 * @param userId - The user ID (auth.users.id)
 * @param profileImageUrl - The new profile image storage path (or null to remove)
 */
export async function updateUserProfileImage(
  userId: string,
  profileImageUrl: string | null
): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  
  const { error } = await (supabase as any)
    .from('account_profiles')
    .update({ profile_image_url: profileImageUrl })
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to update profile image: ${error.message}`);
  }
}

/**
 * Get all profile images for a specific user (to clean up old ones)
 * @param userId - The user ID
 * @returns Array of image file names in storage
 */
export async function getUserProfileImages(userId: string): Promise<string[]> {
  const supabase = createSupabaseBrowserClient();
  
  const { data, error } = await supabase.storage
    .from('profile-images')
    .list(userId);

  if (error) {
    console.error('Failed to list profile images:', error);
    return [];
  }

  return data?.map(file => `${userId}/${file.name}`) || [];
}

/**
 * Clean up old profile images for a user (keeps only the current one)
 * @param userId - The user ID
 * @param currentImagePath - The current image path to keep (if any)
 */
export async function cleanupOldProfileImages(
  userId: string, 
  currentImagePath?: string | null
): Promise<void> {
  try {
    const allImages = await getUserProfileImages(userId);
    const imagesToDelete = allImages.filter(imagePath => 
      imagePath !== currentImagePath && imagePath.startsWith(`${userId}/`)
    );

    if (imagesToDelete.length > 0) {
      console.log(`Cleaning up ${imagesToDelete.length} old profile images for user ${userId}`);
      
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.storage
        .from('profile-images')
        .remove(imagesToDelete);

      if (error) {
        console.error('Failed to cleanup old images:', error);
      } else {
        console.log('Successfully cleaned up old profile images:', imagesToDelete);
      }
    }
  } catch (error) {
    console.error('Cleanup process failed:', error);
  }
}
