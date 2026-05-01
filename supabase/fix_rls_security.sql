-- ============================================
-- セキュリティ強化: RLSポリシー修正
-- Supabase SQL Editor で実行してください
-- ============================================

-- 管理者メールリスト（アプリコードの ADMIN_EMAILS と一致させること）
-- r.matsumoto.3o3@gmail.com
-- nexpure.event@gmail.com
-- admin@pokeka.local
-- player1@pokeka.local

-- ============================================
-- 1. deck_archetypes テーブルのRLS修正
--    （現状: 全員がINSERT/UPDATE可能 → 管理者のみに制限）
-- ============================================

-- 既存の書き込みポリシーを削除
DROP POLICY IF EXISTS "Allow internal insert access" ON public.deck_archetypes;
DROP POLICY IF EXISTS "Allow internal update access" ON public.deck_archetypes;
DROP POLICY IF EXISTS "Only admin can insert deck_archetypes" ON public.deck_archetypes;
DROP POLICY IF EXISTS "Only admin can update deck_archetypes" ON public.deck_archetypes;
DROP POLICY IF EXISTS "Only admin can delete deck_archetypes" ON public.deck_archetypes;

-- 管理者のみINSERT可能
CREATE POLICY "Only admin can insert deck_archetypes" ON public.deck_archetypes
  FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'email') IN (
      'r.matsumoto.3o3@gmail.com',
      'nexpure.event@gmail.com',
      'admin@pokeka.local',
      'player1@pokeka.local'
    )
  );

-- 管理者のみUPDATE可能
CREATE POLICY "Only admin can update deck_archetypes" ON public.deck_archetypes
  FOR UPDATE USING (
    (auth.jwt() ->> 'email') IN (
      'r.matsumoto.3o3@gmail.com',
      'nexpure.event@gmail.com',
      'admin@pokeka.local',
      'player1@pokeka.local'
    )
  );

-- 管理者のみDELETE可能
CREATE POLICY "Only admin can delete deck_archetypes" ON public.deck_archetypes
  FOR DELETE USING (
    (auth.jwt() ->> 'email') IN (
      'r.matsumoto.3o3@gmail.com',
      'nexpure.event@gmail.com',
      'admin@pokeka.local',
      'player1@pokeka.local'
    )
  );

-- 読み取りは引き続き全員OK（サイトの表示に必要）
-- "Allow public read access" ポリシーはそのまま維持

-- ============================================
-- 2. users テーブルのRLS確認・強化
--    （現状: SELECT が自分のみ → 正しいが念のため確認）
-- ============================================

-- 既存の全員参照ポリシーが存在する場合は削除
DROP POLICY IF EXISTS "Allow public read" ON public.users;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;

-- 自分のレコードのみ参照可能（すでに存在する場合は無視）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'users' AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile" ON public.users
      FOR SELECT USING (auth.uid() = id);
  END IF;
END $$;

-- 管理者は全ユーザーを参照可能（UserList コンポーネント用）
DROP POLICY IF EXISTS "Admin can view all users" ON public.users;
CREATE POLICY "Admin can view all users" ON public.users
  FOR SELECT USING (
    (auth.jwt() ->> 'email') IN (
      'r.matsumoto.3o3@gmail.com',
      'nexpure.event@gmail.com',
      'admin@pokeka.local',
      'player1@pokeka.local'
    )
  );

-- ============================================
-- 3. 確認クエリ（実行後に結果を確認）
-- ============================================

SELECT
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('deck_archetypes', 'users')
ORDER BY tablename, cmd;
