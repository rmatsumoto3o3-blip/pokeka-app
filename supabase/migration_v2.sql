-- ============================================
-- データベースマイグレーション - 機能追加
-- ============================================
-- 既存のアプリに新機能を追加するためのスキーマ変更

-- 1. matchesテーブルの拡張（サイド・先後の追加）
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS side TEXT CHECK (side IN ('先攻', '後攻') OR side IS NULL),
ADD COLUMN IF NOT EXISTS going_first BOOLEAN;

-- 2. decksテーブルの変更（デッキコードを任意に）
ALTER TABLE public.decks 
ALTER COLUMN deck_code DROP NOT NULL;

-- 3. 参考デッキテーブルの作成（管理者専用機能）
CREATE TABLE IF NOT EXISTS public.reference_decks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deck_name TEXT NOT NULL,
  deck_code TEXT,
  deck_url TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. reference_decksテーブルのRLS設定
ALTER TABLE public.reference_decks ENABLE ROW LEVEL SECURITY;

-- 誰でも参考デッキを閲覧可能
DROP POLICY IF EXISTS "Anyone can view reference decks" ON public.reference_decks;
CREATE POLICY "Anyone can view reference decks" ON public.reference_decks
  FOR SELECT USING (true);

-- 管理者のみが参考デッキを管理可能
DROP POLICY IF EXISTS "Only admin can insert reference decks" ON public.reference_decks;
CREATE POLICY "Only admin can insert reference decks" ON public.reference_decks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'player1@pokeka.local'
    )
  );

DROP POLICY IF EXISTS "Only admin can update reference decks" ON public.reference_decks;
CREATE POLICY "Only admin can update reference decks" ON public.reference_decks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'player1@pokeka.local'
    )
  );

DROP POLICY IF EXISTS "Only admin can delete reference decks" ON public.reference_decks;
CREATE POLICY "Only admin can delete reference decks" ON public.reference_decks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'player1@pokeka.local'
    )
  );

-- 5. インデックスの追加（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_matches_date_desc ON public.matches(date DESC);
CREATE INDEX IF NOT EXISTS idx_reference_decks_created_at ON public.reference_decks(created_at DESC);

-- ============================================
-- マイグレーション完了
-- ============================================
-- このSQLをSupabase SQL Editorで実行してください
