-- Create beta_invites table
create table if not exists public.beta_invites (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  is_used boolean default false,
  used_by_user_id uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.beta_invites enable row level security;

-- Policy: No public access (managed via Security Definer functions)
create policy "No public access" on public.beta_invites for all using (false);

-- Function to validate invite code on user signup
create or replace function public.validate_invite_code()
returns trigger as $$
declare
  invite_code text;
  invite_record record;
begin
  -- Extract invite code from metadata
  invite_code := new.raw_user_meta_data->>'invite_code';

  -- If no code provided, raise error
  if invite_code is null or length(invite_code) < 1 then
    raise exception 'Beta invite code is required. (招待コードが必要です)';
  end if;

  -- Check if code exists and is unused
  select * into invite_record from public.beta_invites where code = invite_code;

  if invite_record.id is null then
    raise exception 'Invalid invite code. (無効な招待コードです)';
  end if;

  if invite_record.is_used then
    raise exception 'Invite code has already been used. (この招待コードは既に使用されています)';
  end if;

  -- Mark code as used
  update public.beta_invites
  set is_used = true,
      used_by_user_id = new.id
  where id = invite_record.id;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users
-- Note: You must run this in the Supabase SQL Editor designated for the project.
drop trigger if exists on_auth_user_created_check_invite on auth.users;
create trigger on_auth_user_created_check_invite
  before insert on auth.users
  for each row
  execute function public.validate_invite_code();

-- Insert some test invites for the admin to use
insert into public.beta_invites (code) values 
('POKE-BETA-001'),
('POKE-BETA-002'),
('POKE-BETA-003'),
('POKE-BETA-004'),
('POKE-BETA-005')
on conflict (code) do nothing;
