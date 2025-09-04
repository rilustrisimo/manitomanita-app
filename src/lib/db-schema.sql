-- Supabase schema for Manito Manita (minimal MVP)
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  group_name text not null,
  moderator_user_id uuid not null,
  moderator_name text not null,
  moderator_email text not null,
  gift_exchange_date date not null,
  spending_minimum numeric not null,
  is_matched boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_profiles (
  id uuid primary key,
  email text not null unique,
  screen_name text not null,
  contact_details text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  description text not null,
  reference_links jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  target_user_id uuid not null references public.user_profiles(id),
  group_id uuid not null references public.groups(id),
  author_user_id uuid references public.user_profiles(id),
  content text not null,
  is_approved boolean not null default true,
  created_at timestamptz not null default now()
);

-- updated_at triggers
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

-- Matching transactional RPC: applies assignments atomically and marks group matched
-- assignments JSONB format: { "<giver_user_id>": "<receiver_user_id>", ... }
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

-- Indexes
create index if not exists idx_memberships_group on public.memberships(group_id);
create index if not exists idx_memberships_user on public.memberships(user_id);
