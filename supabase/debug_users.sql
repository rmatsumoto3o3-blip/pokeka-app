-- ユーザーとデッキのデバッグ用SQL
-- これを実行して、現在のデータの状態を確認します

-- 1. auth.users (ログインユーザー) と public.users (プロフィール) の整合性チェック
SELECT 
  au.id as auth_id, 
  au.email, 
  pu.id as public_id, 
  pu.nickname
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id;

-- 2. RLSポリシーの確認
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('users', 'decks');
