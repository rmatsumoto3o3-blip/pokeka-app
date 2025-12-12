-- Create articles table
create table if not exists articles (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  content text not null, -- Markdown or HTML
  excerpt text,
  thumbnail_url text,
  is_published boolean default false,
  published_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table articles enable row level security;

-- Policies

-- Public Read: Allow everyone to read published articles
create policy "Allow public read published" on articles 
  for select using (is_published = true);

-- Admin Full Access: Allow admins to do everything
-- Using the same admin email list as Deck Limits exemption
create policy "Allow admin all" on articles 
  for all 
  using ((auth.jwt() ->> 'email') in (
    'player1@pokeka.local', 
    'r.matsumoto.3o3@gmail.com', 
    'nexpure.event@gmail.com', 
    'admin@pokeka.local',
    'rmatsumoto3o3-5798' -- Just in case Vercel user ID shows up differently
  ));

-- Create function to update updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

create trigger update_articles_updated_at
before update on articles
for each row
execute procedure update_updated_at_column();
