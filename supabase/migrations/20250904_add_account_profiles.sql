-- Account profiles table - stores main account information separate from group profiles
create table if not exists public.account_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null,
  phone text,
  contact_details text,
  profile_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add updated_at trigger
create trigger set_account_profiles_updated_at
  before update on public.account_profiles
  for each row execute procedure public.set_updated_at();

-- RLS policies for account_profiles
alter table public.account_profiles enable row level security;

-- Users can only view and manage their own account profile
create policy "account_profiles_select_own"
  on public.account_profiles
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "account_profiles_insert_own"
  on public.account_profiles
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "account_profiles_update_own"
  on public.account_profiles
  for update
  to authenticated
  using (user_id = auth.uid());

create policy "account_profiles_delete_own"
  on public.account_profiles
  for delete
  to authenticated
  using (user_id = auth.uid());

-- Index for performance
create index if not exists idx_account_profiles_user_id on public.account_profiles(user_id);

-- Grant permissions
grant select, insert, update, delete on public.account_profiles to authenticated;
