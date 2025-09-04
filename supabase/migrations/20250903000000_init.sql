-- Supabase schema for Manito Manita (complete fresh setup)
-- Based on detailed specifications with proper relationships and policies

-- Create tables following the exact specification

-- Groups table - stores gift exchange groups
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  group_name text not null,
  moderator_user_id uuid not null, -- references auth.users(id)
  moderator_name text not null,    -- from auth.users metadata
  moderator_email text not null,   -- from auth.users metadata
  gift_exchange_date date not null,
  spending_minimum numeric not null,
  is_matched boolean not null default false,
  is_pro boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User profiles table - created when user joins a group
create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  main_user_id uuid not null, -- references auth.users(id) 
  email text not null,
  screen_name text not null,
  phone_number text,
  delivery_address text,
  profile_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (main_user_id, email) -- one profile per user per email
);

-- Memberships table - links users to groups with roles
create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  role text not null check (role in ('moderator','member')),
  assigned_pair_user_id uuid references public.user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (group_id, user_id)
);

-- Wishlist items table - stores user wishlists per group
create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  description jsonb not null default '[]'::jsonb, -- can store multiple items
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Comments table - general comments for users in groups
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  target_user_id uuid not null references public.user_profiles(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  author_user_id uuid not null references public.user_profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- Comments wishlist table - specific comments for wishlist items
create table if not exists public.comments_wishlist (
  id uuid primary key default gen_random_uuid(),
  wishlist_item_id uuid not null references public.wishlist_items(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  author_user_id uuid not null references public.user_profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- Updated_at triggers
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger set_groups_updated_at
  before update on public.groups
  for each row execute procedure public.set_updated_at();

create trigger set_user_profiles_updated_at
  before update on public.user_profiles
  for each row execute procedure public.set_updated_at();

create trigger set_memberships_updated_at
  before update on public.memberships
  for each row execute procedure public.set_updated_at();

create trigger set_wishlist_items_updated_at
  before update on public.wishlist_items
  for each row execute procedure public.set_updated_at();

-- Business logic functions

-- Function to create group and auto-add moderator membership when they join
create or replace function public.create_group(
  p_group_name text,
  p_gift_exchange_date date,
  p_spending_minimum numeric,
  p_is_pro boolean default false
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_group_id uuid;
  v_user_email text;
  v_user_name text;
begin
  -- Get user info from auth.users
  select email, coalesce(raw_user_meta_data->>'full_name', email) into v_user_email, v_user_name
  from auth.users 
  where id = auth.uid();
  
  if v_user_email is null then
    raise exception 'user_not_authenticated';
  end if;

  -- Create the group
  insert into public.groups (
    group_name, 
    moderator_user_id, 
    moderator_name, 
    moderator_email, 
    gift_exchange_date, 
    spending_minimum,
    is_pro
  ) values (
    p_group_name,
    auth.uid(),
    v_user_name,
    v_user_email,
    p_gift_exchange_date,
    p_spending_minimum,
    p_is_pro
  ) returning id into v_group_id;

  return v_group_id;
end;
$$;

-- Function to join group (creates user_profile and membership)
create or replace function public.join_group(
  p_group_id uuid,
  p_screen_name text,
  p_phone_number text default null,
  p_delivery_address text default null
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_profile_id uuid;
  v_user_email text;
  v_is_moderator boolean;
  v_role text;
begin
  -- Get user email from auth
  select email into v_user_email
  from auth.users 
  where id = auth.uid();
  
  if v_user_email is null then
    raise exception 'user_not_authenticated';
  end if;

  -- Check if group exists and if user is the moderator
  select (moderator_user_id = auth.uid()) into v_is_moderator
  from public.groups 
  where id = p_group_id;
  
  if v_is_moderator is null then
    raise exception 'group_not_found';
  end if;

  -- Set role based on whether user is moderator
  v_role := case when v_is_moderator then 'moderator' else 'member' end;

  -- Create or update user profile
  insert into public.user_profiles (
    main_user_id,
    email,
    screen_name,
    phone_number,
    delivery_address
  ) values (
    auth.uid(),
    v_user_email,
    p_screen_name,
    p_phone_number,
    p_delivery_address
  ) 
  on conflict (main_user_id, email) 
  do update set 
    screen_name = excluded.screen_name,
    phone_number = excluded.phone_number,
    delivery_address = excluded.delivery_address,
    updated_at = now()
  returning id into v_profile_id;

  -- Create membership
  insert into public.memberships (group_id, user_id, role)
  values (p_group_id, v_profile_id, v_role)
  on conflict (group_id, user_id) do nothing;

  return v_profile_id;
end;
$$;

-- Matching transactional RPC: applies assignments atomically and marks group matched
create or replace function public.apply_matching(p_group_id uuid, p_assignments jsonb)
returns void
language plpgsql
security definer
as $$
declare
  v_is_matched boolean;
  v_count int;
  v_key text;
  v_val text;
begin
  -- lock per group
  perform pg_advisory_xact_lock(hashtext(p_group_id::text));

  -- Check if user is moderator of this group
  if not exists (
    select 1 from public.groups 
    where id = p_group_id and moderator_user_id = auth.uid()
  ) then
    raise exception 'not_moderator';
  end if;

  select is_matched into v_is_matched from public.groups where id = p_group_id for update;
  if v_is_matched is null then
    raise exception 'group_not_found';
  end if;
  if v_is_matched then
    raise exception 'already_matched';
  end if;

  select count(*) into v_count from public.memberships where group_id = p_group_id;
  if v_count < 3 then
    raise exception 'min_members';
  end if;

  -- apply assignments
  for v_key, v_val in select key, value::text from jsonb_each_text(p_assignments) loop
    update public.memberships
      set assigned_pair_user_id = v_val::uuid, updated_at = now()
      where group_id = p_group_id and user_id = v_key::uuid;
  end loop;

  update public.groups set is_matched = true, updated_at = now() where id = p_group_id;
end;
$$;

-- Grant permissions
grant execute on function public.create_group(text, date, numeric, boolean) to authenticated;
grant execute on function public.join_group(uuid, text, text, text) to authenticated;
grant execute on function public.apply_matching(uuid, jsonb) to authenticated;

-- Indexes for performance
create index if not exists idx_memberships_group on public.memberships(group_id);
create index if not exists idx_memberships_user on public.memberships(user_id);
create index if not exists idx_user_profiles_main_user on public.user_profiles(main_user_id);
create index if not exists idx_wishlist_items_user_group on public.wishlist_items(user_id, group_id);
create index if not exists idx_comments_target_group on public.comments(target_user_id, group_id);
create index if not exists idx_comments_wishlist_item on public.comments_wishlist(wishlist_item_id);

-- Storage bucket for profile images
insert into storage.buckets (id, name, public)
values ('profile-images', 'profile-images', true)
on conflict (id) do nothing;

-- Storage policies for profile images
create policy "Avatar images are publicly accessible" on storage.objects
  for select using (bucket_id = 'profile-images');

create policy "Anyone can upload an avatar" on storage.objects
  for insert with check (bucket_id = 'profile-images');

create policy "Anyone can update their own avatar" on storage.objects
  for update using (auth.uid()::text = (storage.foldername(name))[1]);

create policy "Anyone can delete their own avatar" on storage.objects
  for delete using (auth.uid()::text = (storage.foldername(name))[1]);

-- Row Level Security policies following business rules

-- FIRST: Disable RLS completely to stop recursion
alter table if exists public.groups disable row level security;
alter table if exists public.memberships disable row level security;
alter table if exists public.user_profiles disable row level security;
alter table if exists public.wishlist_items disable row level security;
alter table if exists public.comments disable row level security;
alter table if exists public.comments_wishlist disable row level security;

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
alter table if exists public.wishlist_items enable row level security;
alter table if exists public.comments enable row level security;
alter table if exists public.comments_wishlist enable row level security;

-- Helper functions (SECURITY DEFINER) to avoid policy recursion
create or replace function public.user_is_member_of_group(p_group_id uuid, p_main_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 
    from public.memberships m
    join public.user_profiles up on m.user_id = up.id
    where m.group_id = p_group_id and up.main_user_id = p_main_user_id
  );
$$;

create or replace function public.get_user_profile_id(p_main_user_id uuid)
returns uuid
language sql
security definer
set search_path = public
as $$
  select id from public.user_profiles where main_user_id = p_main_user_id limit 1;
$$;

grant execute on function public.user_is_member_of_group(uuid, uuid) to authenticated;
grant execute on function public.get_user_profile_id(uuid) to authenticated;

-- GROUPS POLICIES
-- Users can view groups they created or are members of
create policy "groups_select_moderator_and_members"
  on public.groups
  for select
  to authenticated
  using (
    moderator_user_id = auth.uid() 
    OR 
    public.user_is_member_of_group(id, auth.uid())
  );

-- Only authenticated users can create groups (handled by function)
create policy "groups_insert_authenticated"
  on public.groups
  for insert
  to authenticated
  with check (moderator_user_id = auth.uid());

-- Only moderators can update their groups
create policy "groups_update_moderator"
  on public.groups
  for update
  to authenticated
  using (moderator_user_id = auth.uid());

-- USER_PROFILES POLICIES
-- Users can view profiles of people in their groups
create policy "profiles_select_group_members"
  on public.user_profiles
  for select
  to authenticated
  using (
    main_user_id = auth.uid()
    OR
    exists (
      select 1 
      from public.memberships m1
      join public.memberships m2 on m1.group_id = m2.group_id
      where m1.user_id = user_profiles.id 
      and m2.user_id = public.get_user_profile_id(auth.uid())
    )
  );

-- Users can insert their own profiles (handled by join_group function)
create policy "profiles_insert_self"
  on public.user_profiles
  for insert
  to authenticated
  with check (main_user_id = auth.uid());

-- Users can update their own profiles
create policy "profiles_update_self"
  on public.user_profiles
  for update
  to authenticated
  using (main_user_id = auth.uid());

-- MEMBERSHIPS POLICIES
-- Users can view memberships of groups they belong to
create policy "memberships_select_group_members"
  on public.memberships
  for select
  to authenticated
  using (
    public.user_is_member_of_group(group_id, auth.uid())
  );

-- Memberships are created through join_group function only
create policy "memberships_insert_through_function"
  on public.memberships
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.user_profiles 
      where id = user_id and main_user_id = auth.uid()
    )
  );

-- WISHLIST_ITEMS POLICIES
-- Group members can view all wishlists in their groups
create policy "wishlist_select_group_members"
  on public.wishlist_items
  for select
  to authenticated
  using (
    public.user_is_member_of_group(group_id, auth.uid())
  );

-- Users can only create wishlist items for groups they're members of
create policy "wishlist_insert_group_members"
  on public.wishlist_items
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.user_profiles 
      where id = user_id and main_user_id = auth.uid()
    )
    AND 
    public.user_is_member_of_group(group_id, auth.uid())
  );

-- Users can update their own wishlist items
create policy "wishlist_update_owner"
  on public.wishlist_items
  for update
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles 
      where id = user_id and main_user_id = auth.uid()
    )
  );

-- Users can delete their own wishlist items
create policy "wishlist_delete_owner"
  on public.wishlist_items
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles 
      where id = user_id and main_user_id = auth.uid()
    )
  );

-- COMMENTS POLICIES (general user comments)
-- Group members can view all comments in their groups
create policy "comments_select_group_members"
  on public.comments
  for select
  to authenticated
  using (
    public.user_is_member_of_group(group_id, auth.uid())
  );

-- Group members can create comments for users in their groups
create policy "comments_insert_group_members"
  on public.comments
  for insert
  to authenticated
  with check (
    public.user_is_member_of_group(group_id, auth.uid())
    AND
    exists (
      select 1 from public.user_profiles 
      where id = author_user_id and main_user_id = auth.uid()
    )
  );

-- COMMENTS_WISHLIST POLICIES (wishlist-specific comments)
-- Group members can view all wishlist comments in their groups
create policy "comments_wishlist_select_group_members"
  on public.comments_wishlist
  for select
  to authenticated
  using (
    public.user_is_member_of_group(group_id, auth.uid())
  );

-- Group members can create wishlist comments
create policy "comments_wishlist_insert_group_members"
  on public.comments_wishlist
  for insert
  to authenticated
  with check (
    public.user_is_member_of_group(group_id, auth.uid())
    AND
    exists (
      select 1 from public.user_profiles 
      where id = author_user_id and main_user_id = auth.uid()
    )
  );
