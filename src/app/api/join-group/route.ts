import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { groupId, userId } = await request.json();

    if (!groupId || !userId) {
      return NextResponse.json(
        { error: 'Group ID and User ID are required' },
        { status: 400 }
      );
    }

    // Use service role to bypass RLS for group operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Check if the group exists
    const { data: group, error: groupError } = await supabaseAdmin
      .from('groups')
      .select('id')
      .eq('id', groupId)
      .single();

    if (groupError || !group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const { data: existingMembership } = await supabaseAdmin
      .from('memberships')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (existingMembership) {
      return NextResponse.json(
        { message: 'User is already a member of this group' },
        { status: 200 }
      );
    }

    // Add user as a member
    const { error: insertError } = await supabaseAdmin
      .from('memberships')
      .insert({
        group_id: groupId,
        user_id: userId,
        role: 'member'
      });

    if (insertError) {
      console.error('Error adding user to group:', insertError);
      return NextResponse.json(
        { error: 'Failed to join group' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Successfully joined group' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Join group API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
