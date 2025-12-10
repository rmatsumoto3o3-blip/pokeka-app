-- Drop previous definition to avoid conflicts
drop trigger if exists on_auth_user_created_check_invite on auth.users;
drop function if exists public.validate_invite_code();

-- Re-create Function (Logic is largely the same, but timing will be AFTER)
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

-- Re-create Trigger as AFTER INSERT
-- This ensures the user row exists so the Foreign Key constraint on beta_invites works.
-- Raising an exception here will still rollback the User Insert transaction.
create trigger on_auth_user_created_check_invite
  after insert on auth.users
  for each row
  execute function public.validate_invite_code();
