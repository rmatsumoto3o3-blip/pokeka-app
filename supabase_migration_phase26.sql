-- 1. Create user_profiles table
create table public.user_profiles (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  max_decks int not null default 3,
  max_matches int not null default 100,
  plan_type text not null default 'free', -- 'free' or 'invited'
  created_at timestamp with time zone not null default now(),
  constraint user_profiles_pkey primary key (id),
  constraint user_profiles_user_id_key unique (user_id)
) tablespace pg_default;

-- Enable RLS for user_profiles
alter table public.user_profiles enable row level security;

-- Policies for user_profiles
create policy "Users can view their own profile" on public.user_profiles
  for select using (auth.uid() = user_id);

create policy "Users can insert their own profile" on public.user_profiles
  for insert with check (auth.uid() = user_id);
  
-- Allow users to update their profile (for invite code logic via server action, but mostly admin/system)
-- For security, usually controlled via Postgres Functions or Server-side Service Role, 
-- but allowing update for self is acceptable if UI gates logic, or better: use a SECURITY DEFINER function for upgrading.
-- For now, let's keep it simple: Select only. Updates happen via Service Role (Server Actions) or specific function.
-- Actually, Server Actions can use Service Role.

-- 2. Create invitation_codes table
create table public.invitation_codes (
  code text not null,
  is_used boolean not null default false,
  used_by_user_id uuid references auth.users (id),
  used_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  constraint invitation_codes_pkey primary key (code)
) tablespace pg_default;

-- Enable RLS for invitation_codes
alter table public.invitation_codes enable row level security;

-- Policies: 
-- Public (Auth users) can read unused codes? No, security risk.
-- We will handle code verification via a Secure Server Action (Service Role), so no RLS policies needed for public access.
-- Apps/Service Role can read/write.

-- 3. DISABLE OLD BETA INVITE SYSTEM (Allow Free Signups)
drop trigger if exists on_auth_user_created_check_invite on auth.users;
drop function if exists public.validate_invite_code();

-- 4. GRANDFATHERING: All existing users are upgraded to 'invited' (Premium)
-- This ensures current users are not restricted by the new limits.
insert into public.user_profiles (user_id, plan_type, max_decks, max_matches)
select id, 'invited', 20, 500
from auth.users
on conflict (user_id) do nothing;

-- 5. (Optional) Migrate unused legacy codes if you want to keep them valid
-- insert into public.invitation_codes (code)
-- select code from public.beta_invites where is_used = false
-- on conflict do nothing;

-- 6. Insert test code
insert into public.invitation_codes (code) values ('TEST-CODE-2024') on conflict do nothing;
