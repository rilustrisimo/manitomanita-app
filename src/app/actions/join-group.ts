'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export async function joinGroup(groupId: string, screenName: string): Promise<void> {
  // Create Supabase client with service role for bypassing RLS temporarily
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Also get regular client for user auth
  const supabase = await createSupabaseServerClient();
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  // Check if group exists
  const { data: group, error: groupError } = await supabaseAdmin
    .from('groups')
    .select('id, group_name')
    .eq('id', groupId)
    .single();

  if (groupError || !group) {
    throw new Error('Group not found');
  }

  // Ensure account_profiles exists
  const { data: accountProfile, error: accountError } = await supabaseAdmin
    .from('account_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!accountProfile) {
    // Create account profile if it doesn't exist
    const { error: createAccountError } = await supabaseAdmin
      .from('account_profiles')
      .insert({
        user_id: user.id,
        display_name: screenName
      });

    if (createAccountError) {
      console.error('Account profile creation error:', createAccountError);
      throw new Error('Failed to create account profile');
    }
  }

  // Create or get user_profiles entry for this user
  let { data: userProfile, error: userProfileError } = await supabaseAdmin
    .from('user_profiles')
    .select('id')
    .eq('main_user_id', user.id)
    .eq('email', user.email!)
    .single();

  if (!userProfile) {
    // Create user profile for group participation
    const { data: newUserProfile, error: createProfileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        main_user_id: user.id,
        email: user.email!,
        screen_name: screenName
      })
      .select('id')
      .single();

    if (createProfileError || !newUserProfile) {
      console.error('User profile creation error:', createProfileError);
      throw new Error('Failed to create user profile');
    }

    userProfile = newUserProfile;
  }

  // Check if user is already a member using user_profiles.id
  const { data: existingMembership, error: membershipCheckError } = await supabaseAdmin
    .from('memberships')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', userProfile.id)
    .single();

  if (existingMembership) {
    throw new Error('You are already a member of this group');
  }

  // Add user as a member using user_profiles.id
  const { error: membershipError } = await supabaseAdmin
    .from('memberships')
    .insert({
      group_id: groupId,
      user_id: userProfile.id,
      role: 'member'
    });

  if (membershipError) {
    console.error('Membership creation error:', membershipError);
    throw new Error('Failed to join group');
  }

  // Revalidate relevant pages
  revalidatePath('/dashboard');
  revalidatePath(`/groups/${groupId}`);
}
