-- 1. Create table for dynamic deck archetypes if it doesn't exist
create table if not exists deck_archetypes (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Add columns to reference_decks (using DO block for safety)
do $$
begin
    -- Add event_type if not exists
    if not exists (select 1 from information_schema.columns where table_name = 'reference_decks' and column_name = 'event_type') then
        alter table reference_decks 
        add column event_type text check (event_type in ('City League', 'Championship', 'Worldwide', 'Gym Battle'));
    end if;

    -- Add archetype_id if not exists
    if not exists (select 1 from information_schema.columns where table_name = 'reference_decks' and column_name = 'archetype_id') then
        alter table reference_decks 
        add column archetype_id uuid references deck_archetypes(id);
    end if;
end $$;

-- 3. Enable RLS on deck_archetypes
alter table deck_archetypes enable row level security;

-- Policy: Allow public read access
drop policy if exists "Allow public read access" on deck_archetypes;
create policy "Allow public read access" on deck_archetypes for select using (true);

-- Policy: Allow insert for authenticated users (Logic handled by app admin check, but allowing insert here for the API to work)
drop policy if exists "Allow internal insert access" on deck_archetypes;
create policy "Allow internal insert access" on deck_archetypes for insert with check (true);
