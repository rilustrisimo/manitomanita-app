-- Row Level Security policies aligned with the app queries
-- Apply these in Supabase SQL editor. Adjust as needed for privacy.

-- FIRST: Completely disable RLS to stop all recursion
alter table if exists public.groups disable row level security;
alter table if exists public.memberships disable row level security;
alter table if exists public.user_profiles disable row level security;

-- Drop ALL existing policies to ensure clean slate
do $$
declare
    r record;
begin
    for r in (select schemaname, tablename, policyname from pg_policies where schemaname = 'public') loop
        execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
    end loop;
end $$;

-- Enable RLS
alter table if exists public.groups enable row level security;
alter table if exists public.memberships enable row level security;
alter table if exists public.user_profiles enable row level security;

-- Helper functions (SECURITY DEFINER) to avoid policy recursion
create or replace function public.is_moderator_of(p_group_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.groups g
    where g.id = p_group_id and g.moderator_user_id = p_user_id
  );
$$;

create or replace function public.shares_group_with(p_user_a uuid, p_user_b uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships m1
    join public.memberships m2 on m1.group_id = m2.group_id
    where m1.user_id = p_user_a
      and m2.user_id = p_user_b
  );
$$;

grant execute on function public.is_moderator_of(uuid, uuid) to authenticated;
grant execute on function public.shares_group_with(uuid, uuid) to authenticated;

-- Helper: check membership without triggering RLS
create or replace function public.user_is_member_of_group(p_group_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.memberships m where m.group_id = p_group_id and m.user_id = p_user_id
  );
$$;

grant execute on function public.user_is_member_of_group(uuid, uuid) to authenticated;

-- MINIMAL POLICIES: Start with the absolute minimum to avoid any recursion

-- Groups: Allow both moderators and members to see groups they have access to
create policy "groups select members and moderators"
  on public.groups
  for select
  to authenticated
  using (
    moderator_user_id = auth.uid() 
    OR 
    public.user_is_member_of_group(groups.id, auth.uid())
  );

-- Memberships: allow viewing of your own membership rows only
create policy "memberships select own"
  on public.memberships
  for select
  to authenticated
  using (user_id = auth.uid());

-- User profiles: allow viewing your own profile only
create policy "profiles select self only"
  on public.user_profiles
  for select
  to authenticated
  using (user_profiles.id = auth.uid());

-- Notes:
-- - Service role (used by createGroup) bypasses RLS automatically.
-- - If you need moderators to see all member rows of their groups even if they are not explicitly in memberships,
--   prefer a SECURITY DEFINER RPC to avoid policy recursion. Alternatively, ensure the
--   creator is inserted into memberships as moderator (the app already does this via admin client),
--   and keep reads scoped to "own" memberships plus direct group reads via moderator_user_id.
