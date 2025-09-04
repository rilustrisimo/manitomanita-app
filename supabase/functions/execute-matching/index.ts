// Deno Deploy-style Edge Function (placeholder). To be deployed via Supabase CLI.
// This is a scaffold; actual SES integration and updates come next.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SESClient, SendEmailCommand } from "npm:@aws-sdk/client-ses";

function derangement<T>(items: T[]): T[] {
  if (items.length < 2) return [];
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  for (let attempts = 0; attempts < 5; attempts++) {
    let ok = true;
    for (let i = 0; i < arr.length; i++) if (arr[i] === items[i]) { ok = false; break; }
    if (ok) return arr;
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  return items.map((_, i) => items[(i + 1) % items.length]);
}

serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  // SUPABASE_URL and SUPABASE_ANON_KEY are provided by the Functions runtime
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  // Set SERVICE_ROLE_KEY via `supabase secrets set` (cannot start with SUPABASE_)
  const serviceKey = Deno.env.get('SERVICE_ROLE_KEY')!;
  const sesFrom = Deno.env.get('SES_FROM_ADDRESS')!;
  const awsRegion = Deno.env.get('AWS_REGION')!;

  const authHeader = req.headers.get('Authorization') ?? '';
  const authed = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
  const admin = createClient(supabaseUrl, serviceKey);

  try {
    const { groupId } = await req.json();
    if (!groupId) return new Response(JSON.stringify({ error: 'groupId_required' }), { status: 400 });

    // Who is calling?
    const { data: userData, error: userErr } = await authed.auth.getUser();
    if (userErr || !userData.user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });
    const callerId = userData.user.id;

    // Validate moderator and not matched
    const { data: groupRow, error: gErr } = await admin.from('groups').select('id, group_name, is_matched, moderator_user_id').eq('id', groupId).single();
    if (gErr || !groupRow) return new Response(JSON.stringify({ error: 'group_not_found' }), { status: 404 });
    if (groupRow.is_matched) return new Response(JSON.stringify({ error: 'already_matched' }), { status: 400 });
    if (groupRow.moderator_user_id !== callerId) return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403 });

    // Load members
    const { data: members, error: mErr } = await admin.from('memberships').select('user_id').eq('group_id', groupId);
    if (mErr) return new Response(JSON.stringify({ error: 'members_load_failed', details: mErr.message }), { status: 500 });
    const userIds: string[] = members?.map((m: any) => m.user_id) ?? [];
    if (userIds.length < 3) return new Response(JSON.stringify({ error: 'min_members' }), { status: 400 });

    // Compute assignments
    const receivers = derangement(userIds);
    const assignments: Record<string, string> = {};
    userIds.forEach((giver, i) => { assignments[giver] = receivers[i]; });

    // Apply transactionally via RPC
    const { error: rpcErr } = await admin.rpc('apply_matching', { p_group_id: groupId, p_assignments: assignments });
    if (rpcErr) return new Response(JSON.stringify({ error: 'apply_failed', details: rpcErr.message }), { status: 500 });

    // Send emails to members
    const { data: profiles, error: pErr } = await admin.from('user_profiles').select('id,email,screen_name').in('id', userIds);
    if (pErr) return new Response(JSON.stringify({ error: 'profiles_load_failed', details: pErr.message }), { status: 500 });

    const ses = new SESClient({ region: awsRegion });
    const appBase = Deno.env.get('APP_BASE_URL') ?? 'http://localhost:9002';
    const groupLink = `${appBase}/groups/${groupId}`;
    const subject = `Your group is matched!`;

    await Promise.all(
      profiles.map(async (p: any) => {
        const params = new SendEmailCommand({
          Destination: { ToAddresses: [p.email] },
          Message: {
            Body: { Text: { Data: `Hi ${p.screen_name}, your group ${groupRow.group_name} is matched! Visit ${groupLink}` } },
            Subject: { Data: subject }
          },
          Source: sesFrom
        });
        try { await ses.send(params); } catch (_) {/* swallow individual errors */}
      })
    );

    return new Response(JSON.stringify({ ok: true, assignments }), { headers: { 'content-type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'bad_request', details: String(e) }), { status: 400 });
  }
});
