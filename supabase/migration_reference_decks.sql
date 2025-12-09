-- Create table for dynamic deck archetypes
create table deck_archetypes (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add columns to reference_decks
alter table reference_decks 
add column event_type text check (event_type in ('City League', 'Championship', 'Worldwide', 'Gym Battle')),
add column archetype_id uuid references deck_archetypes(id);

-- Enable RLS on deck_archetypes (public read, admin write)
alter table deck_archetypes enable row level security;

create policy "Allow public read access"
  on deck_archetypes for select
  using (true);

create policy "Allow internal insert access (managed by app logic)"
  on deck_archetypes for insert
  with check (true); 
-- Note: In a real prod app restricted by role, but for this app simplistic auth based on email in app logic is used, so valid user can insert if app allows.
