# Manito Manita Rebuild Plan (Next.js + Tailwind + Supabase)

This updates the original Firebase plan to Supabase. Preserve data shapes and behaviors. Do not invent fields. Prefer explicit defaults.

## 0) Ground Truth

Same source-of-truth and key behaviors as before (group access, derangement matching, emails with placeholders).

## 1) Architecture

- Frontend: Next.js (App Router) + Tailwind
- Backend: Supabase (Postgres + RLS, Auth, Storage, Edge Functions)
- Email: AWS SES
- Optional search/vector: pgvector or external

Concerns:
- UI = Next.js
- Data = Supabase Postgres
- Business logic = Supabase Edge Functions (Deno) or Next server actions for non-privileged ops
- Storage = Supabase Storage
- Identity = Supabase Auth (GoTrue)

## 2) Data Model (SQL, authoritative)

IDs are UUIDs (v7 preferred). Keep names aligned to the original spec.

groups
- id uuid pk
- group_name text not null
- moderator_user_id uuid not null references auth.users(id)
- moderator_name text not null
- moderator_email text not null
- gift_exchange_date date not null
- spending_minimum numeric not null
- is_matched boolean not null default false
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()

user_profiles
- id uuid pk references auth.users(id) on delete cascade
- email text not null unique
- screen_name text not null
- contact_details text
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()

memberships
- id uuid pk
- group_id uuid not null references groups(id) on delete cascade
- user_id uuid not null references user_profiles(id) on delete cascade
- role text not null check (role in ('moderator','member'))
- assigned_pair_user_id uuid references user_profiles(id)
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()
- unique (group_id, user_id)

wishlist_items
- id uuid pk
- user_id uuid not null references user_profiles(id) on delete cascade
- group_id uuid not null references groups(id) on delete cascade
- description text not null
- reference_links jsonb not null default '[]'::jsonb
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()

comments
- id uuid pk
- target_user_id uuid not null references user_profiles(id)
- group_id uuid not null references groups(id)
- author_user_id uuid references user_profiles(id)
- content text not null
- is_approved boolean not null default true
- created_at timestamptz not null default now()

email_templates (optional)
- id uuid pk
- tag text not null check (tag in ('new-group','group-matched','new-pass','pass-gen'))
- subject text not null
- body text not null
- is_active boolean not null default true
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()

Notes:
- Profiles are separate from auth.users; keep 1:1 via id.
- Use triggers to set updated_at = now() on update.

## 3) Business Logic (Edge Functions)

Implement as Supabase Edge Functions (Deno) using service role key. Enforce auth/role checks via SQL and RLS.

3.1 executeMatching(groupId)
- Preconditions: group exists; is_matched=false; member count ≥3; caller is moderator.
- Concurrency: begin transaction; select pg_advisory_xact_lock(hashtext(group_id)).
- Steps (in txn):
  1) SELECT memberships for group (role in ('member','moderator')).
  2) Compute derangement in code (no self-assignments).
  3) UPDATE memberships SET assigned_pair_user_id, updated_at=now().
  4) UPDATE groups SET is_matched=true, updated_at=now().
  5) Commit. Then send SES emails to member emails with link to /groups/{groupId}.
- Idempotency: if is_matched=true → error 'already_matched'.

3.2 sendGroupCreatedEmail(groupId)
- Build [email_grouplink] = APP_BASE_URL/groups/{groupId}.
- Personalize [email_name], [email_group]. Send via SES.

3.3 generatePasswordEmail(userId)
- Migration-only. Use GoTrue Admin API to send password reset or magic link ([email_resetpass]).

3.4 addComment(userId, groupId, content)
- Optional reCAPTCHA verification server-side; INSERT and return row.

3.5 leaveGroup(membershipId)
- Preconditions: group.is_matched=false.
- Transaction: DELETE membership and related wishlist_items for that user in that group.

## 4) Frontend (Next.js)

- Use supabase-js with a browser client (anon key) and a server client (service role key only in Edge Functions/server actions as needed).
- Avoid SSR of sensitive data; rely on RLS for client queries; use Edge Functions for privileged ops (matching, moderator edits).
- Pages:
  - /auth (email sign-in, magic link, reset)
  - /dashboard (groups for current user)
  - /groups/[groupId] (overview, members, ShuffleButton, See Match)
  - /groups/create, /groups/[groupId]/edit
  - /profile

## 5) Security (RLS intent)

- groups: SELECT if member; UPDATE/DELETE if moderator; INSERT for authenticated with moderator_user_id = auth.uid().
- memberships: SELECT for group members; UPDATE/DELETE only if NOT is_matched and (owner or moderator). After matched, block assigned_pair_user_id updates and deletes.
- wishlist_items: SELECT for group members; INSERT/UPDATE owner; moderator may UPDATE.
- comments: SELECT for group members; INSERT by members; DELETE by author or moderator.
- email_templates: restricted to admins (or Edge Functions only).

## 6) Migration (WordPress → Supabase)

Export same data as original. Transform and import via Node script using service role key:
1) Insert groups
2) Insert user_profiles (legacy ids allowed)
3) Insert memberships (assigned_pair_user_id if matched)
4) Insert wishlist_items
5) Insert comments
6) Insert email_templates (optional)
Then identity linking: on first login, merge legacy profile → auth.users.id and update memberships.user_id in a txn.

## 7) Email Templates

Placeholders unchanged: [email_name], [email_group], [email_grouplink], [email_resetpass]. Render in Edge Functions and send via SES.

## 8) Affiliate Links

Keep exact mapping:
- Lazada: https://invol.co/aff_m?offer_id=101166&aff_id=189674&source=deeplink_generator_v2&property_id=133170&url=<ENCODED>
- Shopee: https://invol.co/aff_m?offer_id=101653&aff_id=189674&source=deeplink_generator_v2&property_id=133170&url=<ENCODED>
- Handle shp.ee and shope.ee.

## 9) Non-Functional

- Matching: min 3, idempotent; return 'already_matched' if set.
- Concurrency: advisory lock + single txn per group.
- Analytics: lightweight audit table for events.
- Accessibility: keyboard/ARIA.

## 10) Env & Config

- SUPABASE_URL, SUPABASE_ANON_KEY (client)
- SUPABASE_SERVICE_ROLE_KEY (Edge Functions/server)
- APP_BASE_URL
- AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, SES_FROM_ADDRESS
- RECAPTCHA_SITE_KEY, RECAPTCHA_SECRET_KEY (optional)
- Separate dev/stage/prod projects; never mix keys or data.

END OF SPEC — Supabase version