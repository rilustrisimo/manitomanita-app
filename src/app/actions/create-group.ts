'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

interface CreateGroupData {
  groupName: string;
  exchangeDate: string; // ISO date string
  spendingMinimum: number;
}

export async function createGroup(formData: FormData): Promise<string> {
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

  // Get user profile to get screen_name and email using admin client
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .select('screen_name, email')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    throw new Error('User profile not found');
  }

  // Extract form data
  const groupName = formData.get('groupName') as string;
  const exchangeDate = formData.get('exchangeDate') as string;
  const spendingMinimum = Number(formData.get('spendingMinimum'));

  // Validate required fields
  if (!groupName || !exchangeDate || !spendingMinimum) {
    throw new Error('All fields are required');
  }

  // Validate date is not in the past
  const exchangeDateObj = new Date(exchangeDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (exchangeDateObj < today) {
    throw new Error('Exchange date cannot be in the past');
  }

  try {
    // Create the group using admin client
    const { data: newGroup, error: groupError } = await supabaseAdmin
      .from('groups')
      .insert({
        group_name: groupName,
        moderator_user_id: user.id,
        moderator_name: profile.screen_name,
        moderator_email: profile.email,
        gift_exchange_date: exchangeDate,
        spending_minimum: spendingMinimum,
        is_matched: false
      })
      .select()
      .single();

    if (groupError) {
      console.error('Group creation error:', groupError);
      throw new Error('Failed to create group');
    }

    // Add the creator as a moderator member using admin client
    const { error: membershipError } = await supabaseAdmin
      .from('memberships')
      .insert({
        group_id: newGroup.id,
        user_id: user.id,
        role: 'moderator'
      });

    if (membershipError) {
      console.error('Membership creation error:', membershipError);
      // Note: Group was created but membership failed - this is recoverable
    }

  // Revalidate the dashboard page to show the new group
  revalidatePath('/dashboard');
    
  // Return the new group id so the client can navigate reliably
  return newGroup.id as string;
    
  } catch (error) {
    console.error('Group creation error:', error);
    throw error;
  }
}
