-- ============================================
-- 参考デッキRLSポリシーの修正
-- ============================================
-- auth.users テーブルへの直接アクセスを避け、
-- auth.uid() と auth.email() を使用する方法に変更

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Only admin can insert reference decks" ON public.reference_decks;
DROP POLICY IF EXISTS "Only admin can update reference decks" ON public.reference_decks;
DROP POLICY IF EXISTS "Only admin can delete reference decks" ON public.reference_decks;

-- 新しいポリシーを作成（auth.jwt() を使用）
CREATE POLICY "Only admin can insert reference decks" ON public.reference_decks
  FOR INSERT WITH CHECK (
    (auth.jwt() -> 'email')::text = '"player1@pokeka.local"'
  );

CREATE POLICY "Only admin can update reference decks" ON public.reference_decks
  FOR UPDATE USING (
    (auth.jwt() -> 'email')::text = '"player1@pokeka.local"'
  );

CREATE POLICY "Only admin can delete reference decks" ON public.reference_decks
  FOR DELETE USING (
    (auth.jwt() -> 'email')::text = '"player1@pokeka.local"'
  );

-- ============================================
-- 修正完了
-- ============================================
-- これで player1@pokeka.local のみが参考デッキを管理できます
