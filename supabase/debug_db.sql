-- Check if the current user exists in public.users
SELECT count(*) as auth_users_count FROM auth.users;
SELECT count(*) as public_users_count FROM public.users;

-- Check if the specific user (if we know the ID) exists
-- We can't know the ID easily without the browser, but we can list all
SELECT * FROM public.users;

-- Check RLS policies on decks
SELECT * FROM pg_policies WHERE tablename = 'decks';
