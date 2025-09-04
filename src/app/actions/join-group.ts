'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export async function joinGroup(groupId: string): Promise<void> {
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

  // Check if user is already a member
  const { data: existingMembership, error: membershipCheckError } = await supabaseAdmin
    .from('memberships')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .single();

  if (existingMembership) {
    throw new Error('You are already a member of this group');
  }

  // Add user as a member (not moderator)
  const { error: membershipError } = await supabaseAdmin
    .from('memberships')
    .insert({
      group_id: groupId,
      user_id: user.id,
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
