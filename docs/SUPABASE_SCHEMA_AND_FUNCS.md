# Supabase schema and core functions

This document contains the initial SQL and function notes to create the backbone.

## SQL (apply in Supabase SQL Editor)

See `src/lib/db-schema.sql` for tables and triggers.

## RLS policies (to add after tables)

-- Enable RLS
alter table public.groups enable row level security;
alter table public.user_profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.comments enable row level security;

-- Example policies (refine per needs)
-- user_profiles: owner can select/insert/update on self
create policy "profiles_self_select" on public.user_profiles
  for select using (auth.uid() = id);
create policy "profiles_self_upsert" on public.user_profiles
  for insert with check (auth.uid() = id);
create policy "profiles_self_update" on public.user_profiles
  for update using (auth.uid() = id);

-- groups: members can select; moderator can update; any auth can insert with moderator = auth.uid()
create policy "groups_member_select" on public.groups
  for select using (
    exists (
      select 1 from public.memberships m where m.group_id = groups.id and m.user_id = auth.uid()
    )
  );
create policy "groups_insert_mod_is_self" on public.groups
  for insert with check ( moderator_user_id = auth.uid() );

-- memberships: group members can select; updates only by self or moderator and only if not matched
create policy "memberships_member_select" on public.memberships
  for select using (
    exists (
      select 1 from public.memberships m2 where m2.group_id = memberships.group_id and m2.user_id = auth.uid()
    )
  );

-- wishlist: owner select/insert/update; moderator select
create policy "wishlist_owner_rw" on public.wishlist_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "wishlist_mod_select" on public.wishlist_items
  for select using (
    exists (
      select 1 from public.memberships m where m.group_id = wishlist_items.group_id and m.user_id = auth.uid() and m.role = 'moderator'
    )
  );

-- comments: group members select; insert by members
create policy "comments_member_select" on public.comments
  for select using (
    exists (
      select 1 from public.memberships m where m.group_id = comments.group_id and m.user_id = auth.uid()
    )
  );
create policy "comments_member_insert" on public.comments
  for insert with check (
    exists (
      select 1 from public.memberships m where m.group_id = comments.group_id and m.user_id = auth.uid()
    )
  );

## Core function: executeMatching (outline)

- Edge Function (Deno) with service role
- Transaction + advisory lock on group id
- Validate preconditions (moderator, not matched, >=3 members)
- Compute derangement and update memberships.assigned_pair_user_id
- Set groups.is_matched=true
- Post-commit: send SES emails

Implementation will be added under `supabase/functions/execute-matching/`.
