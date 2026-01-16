-- 1. Create 'deck_folders' (Archerypes) table
-- We use 'deck_folders' instead of 'favorites' for clarity, though the plan mentioned favorites.
-- Let's stick to the plan's logical name 'favorites' but maybe 'deck_folders' is better?
-- Plan said 'favorites' (Folder/Archetype). I will use 'deck_archetypes' for clarity in SQL if I can, but to match the plan exactly I should check.
-- The plan said: "favorites (New Table: Folder/Archetype)".
-- I will use 'user_deck_archetypes' to be very specific and avoid collision with any future favorites feature.

-- Table: user_deck_archetypes
create table
  public.user_deck_archetypes (
    id uuid not null default gen_random_uuid (),
    user_id uuid not null default auth.uid (),
    name text not null,
    created_at timestamp with time zone not null default now(),
    constraint user_deck_archetypes_pkey primary key (id),
    constraint user_deck_archetypes_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
  ) tablespace pg_default;

-- 2. Alter 'decks' table to add hierarchy and tracking columns
alter table public.decks
add column archetype_id uuid null references public.user_deck_archetypes (id) on delete set null,
add column version_label text null default 'v1.0',
add column memo text null,
add column sideboard_cards jsonb null default '[]'::jsonb,
add column is_current boolean not null default false;

-- 3. Policy handling (if RLS is enabled, which is standard in Supabase)
-- Enable RLS on new table
alter table public.user_deck_archetypes enable row level security;

-- Create Policy for Select
create policy "Users can view their own archetypes" on public.user_deck_archetypes
as permissive for select
to authenticated
using ((auth.uid() = user_id));

-- Create Policy for Insert
create policy "Users can create their own archetypes" on public.user_deck_archetypes
as permissive for insert
to authenticated
with check ((auth.uid() = user_id));

-- Create Policy for Update
create policy "Users can update their own archetypes" on public.user_deck_archetypes
as permissive for update
to authenticated
using ((auth.uid() = user_id));

-- Create Policy for Delete
create policy "Users can delete their own archetypes" on public.user_deck_archetypes
as permissive for delete
to authenticated
using ((auth.uid() = user_id));
